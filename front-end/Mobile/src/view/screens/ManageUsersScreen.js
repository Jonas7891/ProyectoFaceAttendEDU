import React, {useEffect, useState} from 'react';
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import styles from './Styles/ManageUsersScreen/Style';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../components/common/ThemeContext';
import {useCustomAlert} from '../components/common/useCustomAlert';
import CustomAlert from '../components/common/CustomAlert';
import BackButton from '../components/common/BackButton';
import PrimaryButton from '../components/auth/PrimaryButton';
import {useManageUsersViewModel} from '../../viewmodels/useManageUsersViewModel';
import {validateEmail} from '../../utils/validators';

export default function ManageUsersScreen({navigation, userRole, onLogout}) {
    const {t} = useTranslation();
    const {colors, theme, toggleTheme} = useTheme();
    const {alertConfig, hideAlert, showError, showConfirm} = useCustomAlert();

    const {
        allStudents,
        students,
        teachers,
        schools,
        updateKey,
        searchStudents,
        searchTeachers,
        createStaff,
        updateStudent,
        deleteStudent,
        updateTeacher,
        deleteTeacher,
    } = useManageUsersViewModel(userRole === 'Administrador');

    const [tab, setTab] = useState('students');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState(null);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        documento: '',
        email: '',
        grado: '',
        telefono: '',
        materia: '',
        password: '',
        role: 'teacher',
        schoolId: null,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (userRole && userRole !== 'Administrador') {
            showError(
                t('manageUsers.accessDenied'),
                t('manageUsers.onlyAdmins')
            );
            navigation.goBack();
        }
    }, [userRole, navigation, showError]);

    const openAdd = () => {
        setEditing(null);
        setForm({nombre: '', documento: '', email: '', grado: '', telefono: '', materia: '', password: '', role: 'teacher', schoolId: null});
        setSearchQuery('');
        setSearchResults([]);
        setModalMode('searchAdd');
        setModalVisible(true);
    };

    // Alta de personal nuevo (docente/administrador) en el backend.
    const openCreate = () => {
        setEditing(null);
        setForm({nombre: '', documento: '', email: '', grado: '', telefono: '', materia: '', password: '', role: 'teacher', schoolId: null});
        setModalMode('create');
        setModalVisible(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({...item});
        setModalMode('edit');
        setModalVisible(true);
    };

    const closeModal = () => {
        Keyboard.dismiss();
        setModalVisible(false);
        setModalMode(null);
    };

    const handleBackdropPress = () => {
        if (Keyboard.isVisible && Keyboard.isVisible()) {
            Keyboard.dismiss();
        } else {
            closeModal();
        }
    };

    const handleSave = () => {
        Keyboard.dismiss();
        if (!form.nombre) {
            showError(t('manageUsers.validation'), t('manageUsers.nameRequired'));
            return;
        }
        if (form.email && !validateEmail(form.email)) {
            showError(t('manageUsers.validation'), t('manageUsers.invalidEmail'));
            return;
        }
        if (modalMode === 'edit') {
            if (tab === 'students') {
                updateStudent({...editing, ...form});
            } else {
                updateTeacher({...editing, ...form});
            }
        }
        closeModal();
    };

    const handleCreate = async () => {
        Keyboard.dismiss();
        if (!form.nombre) {
            showError(t('manageUsers.validation'), t('manageUsers.nameRequired'));
            return;
        }
        if (!form.documento) {
            showError(t('manageUsers.validation'), t('manageUsers.documentRequired'));
            return;
        }
        if (!form.email || !validateEmail(form.email)) {
            showError(t('manageUsers.validation'), t('manageUsers.invalidEmail'));
            return;
        }
        if (!form.password || form.password.length < 8) {
            showError(t('manageUsers.validation'), t('manageUsers.passwordMin'));
            return;
        }
        if (form.role === 'admin' && form.schoolId == null) {
            showError(t('manageUsers.validation'), t('manageUsers.schoolRequired'));
            return;
        }
        setSaving(true);
        try {
            await createStaff({
                nombre: form.nombre.trim(),
                documento: form.documento.trim(),
                email: form.email.trim(),
                telefono: form.telefono.trim(),
                password: form.password,
                role: form.role,
                schoolId: form.schoolId,
            });
            closeModal();
        } catch (e) {
            showError(t('manageUsers.validation'), e?.message || t('manageUsers.createError'));
        } finally {
            setSaving(false);
        }
    };

    const confirmToggleStatus = (id, isActive) => {
        showConfirm(
            t('manageUsers.confirm'),
            t(isActive ? 'manageUsers.deactivateQuestion' : 'manageUsers.activateQuestion'),
            () => {
                tab === 'students' ? deleteStudent(id) : deleteTeacher(id);
            }
        );
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (tab === 'students') {
            setSearchResults(searchStudents(text));
        } else {
            setSearchResults(searchTeachers ? searchTeachers(text) : []);
        }
    };

    const handleBack = () => navigation.goBack();

    const renderItem = ({item}) => {
        const inactive = item.status === false;
        return (
        <View style={[styles.manageUsersItem, {backgroundColor: colors.card}, inactive && {opacity: 0.55}]}>
            <View style={styles.manageUsersItemInfo}>
                <Text style={[styles.manageUsersItemName, {color: colors.text}]} numberOfLines={1}>
                    {item.nombre}
                </Text>
                <Text style={[styles.manageUsersItemMeta, {color: colors.textSecondary}]} numberOfLines={1}>
                    {tab === 'students'
                        ? `${item.grado || ''} • ${item.email || ''}`
                        : `${item.materia || ''} • ${item.email || ''}`}
                    {inactive ? ` • ${t('manageUsers.inactive')}` : ''}
                </Text>
            </View>
            <View style={styles.manageUsersItemActions}>
                <TouchableOpacity
                    style={[styles.manageUsersActionButton, {borderColor: colors.primary}]}
                    onPress={() => openEdit(item)}
                >
                    <Text style={[styles.manageUsersActionText, {color: colors.primary}]}>
                        {t('common.edit')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.manageUsersActionButton, {borderColor: inactive ? '#2E7D32' : '#E53935'}]}
                    onPress={() => confirmToggleStatus(item.id, !inactive)}
                >
                    <Text style={[styles.manageUsersActionText, {color: inactive ? '#2E7D32' : '#E53935'}]}>
                        {inactive ? t('common.activate') : t('common.deactivate')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
        );
    };

    const renderSearchAddContent = () => (
        <>
            <View style={[styles.manageUsersSheetHandle, {backgroundColor: colors.border}]}/>

            <Text style={[styles.manageUsersModalTitle, {color: colors.text}]}>
                {tab === 'students'
                    ? t('manageUsers.searchStudent')
                    : t('manageUsers.searchTeacher')}
            </Text>
            <View style={[styles.manageUsersDivider, {backgroundColor: colors.border}]}/>

            <TextInput
                placeholder={
                    tab === 'students'
                        ? t('manageUsers.enterStudentName')
                        : t('manageUsers.enterTeacherName')
                }
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageUsersInput, {
                    color: colors.text,
                    backgroundColor: colors.modalInputBackground,
                    borderColor: colors.modalBorder,
                }]}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus={true}
            />

            <View style={styles.manageUsersResultsList}>
                {searchResults.length > 0 ? searchResults.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.manageUsersSearchItem, {borderColor: colors.border}]}
                        onPress={() => {
                            // El resultado ya existe en el backend: se abre
                            // su edición real en vez de un agregado falso.
                            openEdit(item);
                        }}
                    >
                        <View style={{flex: 1}}>
                            <Text style={[styles.manageUsersSearchItemName, {color: colors.text}]}>
                                {item.nombre}
                            </Text>
                            <Text style={[styles.manageUsersSearchItemMeta, {color: colors.textSecondary}]}>
                                {tab === 'students'
                                    ? `${item.grado} • ${item.email}`
                                    : `${item.materia} • ${item.email}`}
                            </Text>
                        </View>
                        <Text style={[styles.manageUsersAddButtonText, {color: colors.primary}]}>
                            {t('common.edit')}
                        </Text>
                    </TouchableOpacity>
                )) : (
                    <View style={styles.manageUsersEmptySearch}>
                        <Text style={[styles.manageUsersEmptySearchText, {color: colors.textSecondary}]}>
                            {t('manageUsers.enterNameToSearch')}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.manageUsersModalActions}>
                <TouchableOpacity
                    style={[styles.manageUsersCancelButton, {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                    }]}
                    onPress={closeModal}
                >
                    <Text style={styles.manageUsersCancelButtonText}>
                        {t('common.cancel')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    const renderCreateContent = () => {
        const inputStyle = {
            color: colors.text,
            backgroundColor: colors.modalInputBackground,
            borderColor: colors.modalBorder,
        };
        const setField = (key) => (text) => setForm((f) => ({...f, [key]: text}));
        return (
        <>
            <View style={[styles.manageUsersSheetHandle, {backgroundColor: colors.border}]}/>

            <Text style={[styles.manageUsersModalTitle, {color: colors.text}]}>
                {t('manageUsers.newUser')}
            </Text>
            <View style={[styles.manageUsersDivider, {backgroundColor: colors.border}]}/>

            <Text style={[styles.manageUsersFieldLabel, {color: colors.text}]}>
                {t('common.name')}
            </Text>
            <TextInput
                placeholder={t('common.name')}
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageUsersInput, inputStyle]}
                value={form.nombre}
                onChangeText={setField('nombre')}
            />

            <Text style={[styles.manageUsersFieldLabel, {color: colors.text}]}>
                {t('manageUsers.document')}
            </Text>
            <TextInput
                placeholder={t('manageUsers.document')}
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageUsersInput, inputStyle]}
                value={form.documento}
                onChangeText={setField('documento')}
                keyboardType="numeric"
            />

            <Text style={[styles.manageUsersFieldLabel, {color: colors.text}]}>
                {t('common.email')}
            </Text>
            <TextInput
                placeholder={t('common.email')}
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageUsersInput, inputStyle]}
                value={form.email}
                onChangeText={setField('email')}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <Text style={[styles.manageUsersFieldLabel, {color: colors.text}]}>
                {t('common.phone')}
            </Text>
            <TextInput
                placeholder={t('common.phone')}
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageUsersInput, inputStyle]}
                value={form.telefono}
                onChangeText={setField('telefono')}
                keyboardType="phone-pad"
            />

            <Text style={[styles.manageUsersFieldLabel, {color: colors.text}]}>
                {t('manageUsers.password')}
            </Text>
            <TextInput
                placeholder={t('manageUsers.passwordMin')}
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageUsersInput, inputStyle]}
                value={form.password}
                onChangeText={setField('password')}
                secureTextEntry
            />

            <Text style={[styles.manageUsersFieldLabel, {color: colors.text}]}>
                {t('manageUsers.role')}
            </Text>
            <View style={{flexDirection: 'row', gap: 8, marginBottom: 12}}>
                {[
                    {value: 'teacher', label: t('userRoles.teacher')},
                    {value: 'admin', label: t('userRoles.administrator')},
                ].map((opt) => (
                    <TouchableOpacity
                        key={opt.value}
                        onPress={() => setForm((f) => ({...f, role: opt.value}))}
                        style={[styles.manageUsersActionButton, {
                            borderColor: colors.primary,
                            backgroundColor: form.role === opt.value ? colors.primary : 'transparent',
                            flex: 1,
                            alignItems: 'center',
                        }]}
                    >
                        <Text style={[styles.manageUsersActionText, {
                            color: form.role === opt.value ? '#fff' : colors.primary,
                        }]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {form.role === 'admin' && (
                <>
                    <Text style={[styles.manageUsersFieldLabel, {color: colors.text}]}>
                        {t('manageUsers.school')}
                    </Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12}}>
                        {(schools ?? []).map((school) => (
                            <TouchableOpacity
                                key={String(school.schoolId)}
                                onPress={() => setForm((f) => ({...f, schoolId: school.schoolId}))}
                                style={[styles.manageUsersActionButton, {
                                    borderColor: colors.primary,
                                    backgroundColor: form.schoolId === school.schoolId ? colors.primary : 'transparent',
                                    alignItems: 'center',
                                    paddingHorizontal: 12,
                                }]}
                            >
                                <Text style={[styles.manageUsersActionText, {
                                    color: form.schoolId === school.schoolId ? '#fff' : colors.primary,
                                }]}>
                                    {school.name || school.code}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            <View style={styles.manageUsersModalActions}>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleCreate}
                    disabled={saving}
                >
                    <Text style={[styles.secondaryButtonText, {color: colors.textSecondary}]}>
                        {saving ? t('common.saving') : t('common.save')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.manageUsersCancelButton, {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                    }]}
                    onPress={closeModal}
                >
                    <Text style={styles.manageUsersCancelButtonText}>
                        {t('common.cancel')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
        );
    };

    const renderEditContent = () => (
        <>
            <View style={[styles.manageUsersSheetHandle, {backgroundColor: colors.border}]}/>

            <Text style={[styles.manageUsersModalTitle, {color: colors.text}]}>
                {editing ? t('manageUsers.editStudentInfo') : t('manageUsers.newRecord')}
            </Text>
            <View style={[styles.manageUsersDivider, {backgroundColor: colors.border}]}/>

            <Text style={[styles.manageUsersFieldLabel, {color: colors.text}]}>
                {t('common.name')}
            </Text>
            <TextInput
                placeholder={t('common.name')}
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageUsersInput, {
                    color: colors.text,
                    backgroundColor: colors.modalInputBackground,
                    borderColor: colors.modalBorder,
                }]}
                value={form.nombre}
                onChangeText={(text) => setForm((f) => ({...f, nombre: text}))}
            />

            <Text style={[styles.manageUsersFieldLabel, {color: colors.text}]}>
                {t('common.email')}
            </Text>
            <TextInput
                placeholder={t('common.email')}
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageUsersInput, {
                    color: colors.text,
                    backgroundColor: colors.modalInputBackground,
                    borderColor: colors.modalBorder,
                }]}
                value={form.email}
                onChangeText={(text) => setForm((f) => ({...f, email: text}))}
                keyboardType="email-address"
            />

            {tab === 'students' ? (
                <>
                    <Text style={[styles.manageUsersFieldLabel, {color: colors.text}]}>
                        {t('manageUsers.grade')}
                    </Text>
                    <TextInput
                        placeholder={t('manageUsers.grade')}
                        placeholderTextColor={colors.modalInputPlaceholder}
                        style={[styles.manageUsersInput, {
                            color: colors.text,
                            backgroundColor: colors.modalInputBackground,
                            borderColor: colors.modalBorder,
                        }]}
                        value={form.grado}
                        onChangeText={(text) => setForm((f) => ({...f, grado: text}))}
                    />
                </>
            ) : (
                <>
                    <Text style={[styles.manageUsersFieldLabel, {color: colors.text}]}>
                        {t('manageUsers.subject')}
                    </Text>
                    <TextInput
                        placeholder={t('manageUsers.subject')}
                        placeholderTextColor={colors.modalInputPlaceholder}
                        style={[styles.manageUsersInput, {
                            color: colors.text,
                            backgroundColor: colors.modalInputBackground,
                            borderColor: colors.modalBorder,
                        }]}
                        value={form.materia}
                        onChangeText={(text) => setForm((f) => ({...f, materia: text}))}
                    />
                </>
            )}

            <View style={styles.manageUsersModalActions}>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleSave}
                >
                    <Text
                        style={[
                            styles.secondaryButtonText,
                            {color: colors.textSecondary},
                        ]}
                    >
                        {t('common.save')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.manageUsersCancelButton, {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                    }]}
                    onPress={closeModal}
                >
                    <Text style={styles.manageUsersCancelButtonText}>
                        {t('common.cancel')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={[styles.manageUsersContainer, {backgroundColor: colors.background}]}>
                <View style={[styles.manageUsersHeader, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                    <BackButton onPress={handleBack} />
                    <Text style={[styles.manageUsersTitle, {color: colors.text, flex: 1}]}>
                        {t('manageUsers.title')}
                    </Text>
                </View>

                <View style={styles.manageUsersTabs}>
                    <TouchableOpacity
                        style={[
                            styles.manageUsersTabButton,
                            tab === 'students' && {borderBottomColor: colors.primary, borderBottomWidth: 2},
                        ]}
                        onPress={() => setTab('students')}
                    >
                        <Text style={[styles.manageUsersTabText, {
                            color: tab === 'students' ? colors.primary : colors.text
                        }]}>
                            {t('manageUsers.students')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.manageUsersTabButton,
                            tab === 'teachers' && {borderBottomColor: colors.primary, borderBottomWidth: 2},
                        ]}
                        onPress={() => setTab('teachers')}
                    >
                        <Text style={[styles.manageUsersTabText, {
                            color: tab === 'teachers' ? colors.primary : colors.text
                        }]}>
                            {t('manageUsers.teachers')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.manageUsersActionsRow}>
                    <PrimaryButton
                        title={
                            tab === 'students'
                                ? t('manageUsers.addStudent')
                                : t('manageUsers.addTeacher')
                        }
                        onPress={openAdd}
                    />
                    <TouchableOpacity
                        style={[styles.secondaryButton, {flex: 1, alignItems: 'center', marginTop: 8}]}
                        onPress={openCreate}
                    >
                        <Text style={[styles.secondaryButtonText, {color: colors.primary}]}>
                            {t('manageUsers.newUser')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={tab === 'students' ? students : teachers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.manageUsersList}
                    ListEmptyComponent={() => (
                        <View style={styles.manageUsersEmpty}>
                            <Text style={[styles.manageUsersEmptyText, {color: colors.textSecondary}]}>
                                {t('manageUsers.noRecords')}
                            </Text>
                        </View>
                    )}
                />

                {/* ===== MODAL ===== */}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent
                    onRequestClose={closeModal}
                >
                    <KeyboardAvoidingView
                        style={styles.manageUsersKav}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View style={styles.manageUsersOverlay}>
                            <Pressable style={styles.manageUsersBackdrop} onPress={handleBackdropPress}/>

                            <ScrollView
                                style={[styles.manageUsersSheet, {backgroundColor: colors.card}]}
                                contentContainerStyle={styles.manageUsersSheetContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={true}
                                bounces={false}
                            >
                                {modalMode === 'searchAdd' ? renderSearchAddContent() : modalMode === 'create' ? renderCreateContent() : renderEditContent()}
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                <CustomAlert
                    visible={alertConfig.visible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    buttons={alertConfig.buttons}
                    onClose={hideAlert}
                    type={alertConfig.type}
                />
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

