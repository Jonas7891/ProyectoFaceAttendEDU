package com.faceattend_edu.identity_service;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Hexagonal layer rules, checked on the imports of the main sources (no extra dependency):
 * the domain depends on nothing outward, the application not on adapters, and a controller
 * only reaches the use cases. {@link #ALLOWED} lists the known exceptions, so a new one fails.
 */
class LayerDependencyRulesTest {

    private static final Path ROOT = Path.of("src/main/java/com/faceattend_edu/identity_service");
    private static final String BASE = "com\\.faceattend_edu\\.identity_service\\.";

    /** "file -> imported type" pairs that are accepted on purpose. */
    private static final Set<String> ALLOWED = Set.of(
            // It maps the storage exception the port declares to a 503; it calls no port.
            "adapter/in/web/controller/GlobalExceptionHandler.java -> com.faceattend_edu.identity_service.application.port.out.GuardianDocumentStoragePort");

    @Test
    void theDomainDependsOnNoOtherLayer() {
        assertThat(violations("domain/", "(application|infrastructure|adapter)\\.")).isEmpty();
    }

    @Test
    void theApplicationDoesNotDependOnAdapters() {
        assertThat(violations("application/", "(infrastructure|adapter)\\.")).isEmpty();
    }

    @Test
    void controllersOnlyReachTheUseCases() {
        assertThat(violations("web/controller/",
                "(domain\\.port\\.out|application\\.port\\.out|infrastructure\\.persistence|adapter\\.out)\\."))
                .isEmpty();
    }

    private static List<String> violations(String pathPart, String forbiddenLayer) {
        Pattern forbidden = Pattern.compile("^import\\s+(" + BASE + forbiddenLayer + "[\\w.]+);", Pattern.MULTILINE);
        try (Stream<Path> files = Files.walk(ROOT)) {
            return files
                    .filter(file -> file.toString().endsWith(".java"))
                    .filter(file -> inLayer(file, pathPart))
                    .flatMap(file -> imports(file, forbidden))
                    .filter(pair -> !ALLOWED.contains(pair))
                    .toList();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** `domain/` matches the top-level layer; `web/controller/` matches it at any depth. */
    private static boolean inLayer(Path file, String pathPart) {
        String name = ROOT.relativize(file).toString().replace('\\', '/');
        return name.startsWith(pathPart) || name.contains("/" + pathPart);
    }

    private static Stream<String> imports(Path file, Pattern forbidden) {
        try {
            String name = ROOT.relativize(file).toString().replace('\\', '/');
            return forbidden.matcher(Files.readString(file)).results().map(m -> name + " -> " + m.group(1));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
