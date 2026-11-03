package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.out.LoadPersonPort;
import com.faceattend_edu.identity_service.application.port.out.LoadUserPort;
import com.faceattend_edu.identity_service.application.port.out.UpdatePersonPort;
import com.faceattend_edu.identity_service.application.port.out.UpdateUserPort;
import com.faceattend_edu.identity_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.identity_service.domain.model.Person;
import com.faceattend_edu.identity_service.domain.model.User;
import com.faceattend_edu.identity_service.domain.service.UserActivationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** AUD-23 (follow-up of AUD-74): a soft-deleted account or person cannot be modified, and an update keeps its audit trail. */
@DisplayName("Updates over soft-deleted accounts and persons")
class DeletedRecordUpdatesTest {

    private static final UUID USER_ID = UUID.fromString("11111111-1111-4111-8111-111111111111");
    private static final UUID PERSON_ID = UUID.fromString("22222222-2222-4222-8222-222222222222");
    private static final UUID AUTHOR = UUID.fromString("33333333-3333-4333-8333-333333333333");
    private static final LocalDateTime CREATED = LocalDateTime.of(2026, 1, 1, 8, 0);

    private final LoadUserPort loadUser = mock(LoadUserPort.class);
    private final UpdateUserPort updateUser = mock(UpdateUserPort.class);
    private final LoadPersonPort loadPerson = mock(LoadPersonPort.class);
    private final UpdatePersonPort updatePerson = mock(UpdatePersonPort.class);

    private static Person person() {
        Person p = new Person();
        p.setPersonId(PERSON_ID);
        p.setDocumentNumber("1020");
        p.setName("Ana");
        p.setLastName("Perez");
        p.setStatus(true);
        p.setCreatedAt(CREATED);
        return p;
    }

    private static User account() {
        User u = new User();
        u.setUserId(USER_ID);
        u.setPersonId(person());
        u.setUsername("ana.perez");
        u.setPasswordHash("$2a$12$hash");
        u.setStatus(true);
        u.setCreatedAt(CREATED);
        u.setCreatedBy(AUTHOR);
        return u;
    }

    private static User deletedAccount() {
        User u = account();
        u.setDeletedAt(LocalDateTime.of(2026, 10, 1, 9, 0));
        u.setDeletedBy(AUTHOR);
        return u;
    }

    @Test
    @DisplayName("a full update of an account keeps who created it")
    void anAccountUpdateKeepsItsAuthor() {
        when(loadUser.loadUser(USER_ID)).thenReturn(account());
        User patch = new User();
        patch.setUserId(USER_ID);
        patch.setUsername("ana.p");

        new UpdateUserUseCaseImpl(updateUser, loadUser).updateUser(patch);

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(updateUser).updateUser(saved.capture());
        assertThat(saved.getValue().getCreatedBy()).isEqualTo(AUTHOR);
        assertThat(saved.getValue().getCreatedAt()).isEqualTo(CREATED);
        assertThat(saved.getValue().getDeletedAt()).isNull();
        assertThat(saved.getValue().getDeletedBy()).isNull();
    }

    @Test
    @DisplayName("updating a deleted account is a 404 and writes nothing")
    void updatingADeletedAccountIsNotFound() {
        when(loadUser.loadUser(USER_ID)).thenReturn(deletedAccount());
        User patch = new User();
        patch.setUserId(USER_ID);
        patch.setUsername("ana.p");

        assertThatThrownBy(() -> new UpdateUserUseCaseImpl(updateUser, loadUser).updateUser(patch))
                .isInstanceOf(EntityNotFoundException.class);
        verify(updateUser, never()).updateUser(any(User.class));
    }

    @Test
    @DisplayName("changing the status of a deleted account is a 404 and writes nothing")
    void changingTheStatusOfADeletedAccountIsNotFound() {
        when(loadUser.loadUser(USER_ID)).thenReturn(deletedAccount());

        assertThatThrownBy(() -> new ChangeUserStatusUseCaseImpl(loadUser, updateUser).changeStatus(USER_ID, true))
                .isInstanceOf(EntityNotFoundException.class);
        verify(updateUser, never()).updateUser(any(User.class));
    }

    @Test
    @DisplayName("activating a deleted account is a 404 and writes nothing")
    void activatingADeletedAccountIsNotFound() {
        when(loadUser.loadUser(USER_ID)).thenReturn(deletedAccount());
        UserActivationService activation = mock(UserActivationService.class);

        assertThatThrownBy(() -> new ActivateUserUseCaseImpl(loadUser, updateUser, activation).activateUser(USER_ID))
                .isInstanceOf(EntityNotFoundException.class);
        verify(activation, never()).activateUser(any(User.class));
        verify(updateUser, never()).updateUser(any(User.class));
    }

    @Test
    @DisplayName("updating or changing the status of a deleted person is a 404 and writes nothing")
    void aDeletedPersonCannotBeModified() {
        Person deleted = person();
        deleted.setDeletedAt(LocalDateTime.of(2026, 10, 1, 9, 0));
        when(loadPerson.loadPerson(PERSON_ID)).thenReturn(deleted);

        assertThatThrownBy(() -> new UpdatePersonUseCaseImpl(loadPerson, updatePerson).updatePerson(PERSON_ID, person()))
                .isInstanceOf(EntityNotFoundException.class);
        assertThatThrownBy(() -> new ChangePersonStatusUseCaseImpl(loadPerson, updatePerson).changeStatus(PERSON_ID, true))
                .isInstanceOf(EntityNotFoundException.class);
        verify(updatePerson, never()).updatePerson(any(Person.class));
    }
}
