package com.faceattend_edu.identity_service.adapter.in.web.security;

import com.faceattend_edu.identity_service.adapter.in.web.dto.PersonDto;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Data minimization (Ley 1581, art. 4 and art. 5 for health data): an instructor or a
 * learner sees the people in their scope to run a class, not their health or home data.
 * For anyone but the caller, a non-administrator gets no blood type, address or birth
 * date, and only the last four characters of the document number. Administrators and
 * the caller's own record keep every field.
 */
public final class PersonFieldRedactor {

    /** Set by {@link AuthTokenFilter} for callers without person administration: the caller's own person id. */
    public static final String LIMITED_VIEW_ATTRIBUTE = "identity.limitedPersonView";

    private static final int VISIBLE_DOCUMENT_CHARS = 4;

    private PersonFieldRedactor() {
    }

    public static PersonDto apply(PersonDto person, HttpServletRequest request) {
        Object own = request.getAttribute(LIMITED_VIEW_ATTRIBUTE);
        if (own == null || person == null) return person;
        if (person.getPersonId() != null && person.getPersonId().toString().equalsIgnoreCase(own.toString())) {
            return person;
        }
        person.setBloodType(null);
        person.setAddress(null);
        person.setBirthDate(null);
        person.setDocumentNumber(mask(person.getDocumentNumber()));
        return person;
    }

    static String mask(String document) {
        if (document == null || document.length() <= VISIBLE_DOCUMENT_CHARS) return document;
        return "*".repeat(document.length() - VISIBLE_DOCUMENT_CHARS)
                + document.substring(document.length() - VISIBLE_DOCUMENT_CHARS);
    }
}
