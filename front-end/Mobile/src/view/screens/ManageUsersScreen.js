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
import styles from './Style';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../components/common/ThemeContext';
import {useCustomAlert} from '../components/common/useCustomAlert';
import CustomAlert from '../components/common/CustomAlert';
import PrimaryButton from '../components/auth/PrimaryButton';
import {useManageUsersViewModel} from '../../viewmodels/useManageUsersViewModel';

export default function ManageUsersScreen({navigation, userRole, onLogout}) {
    const {t} = useTranslation();
    const {colors, theme, toggleTheme} = useTheme();
    const {alertConfig, hideAlert, showError, showConfirm} = useCustomAlert();

    const {
        allStudents,
        students,
        teachers,
        updateKey,
        searchStudents,
        searchTeachers,
        addStudentById,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
    } = useManageUsersViewModel();

    const [tab, setTab] = useState('students');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        nombre: '',
        email: '',
        grado: '',
        telefono: '',
        materia: '',
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
        setForm({nombre: '', email: '', grado: '', telefono: '', materia: ''});
        setSearchQuery('');
        setSearchResults([]);
        setModalMode('searchAdd');
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
        if (modalMode === 'edit') {
            if (tab === 'students') {
                updateStudent({...editing, ...form});
            } else {
                updateTeacher({...editing, ...form});
            }
        }
        closeModal();
    };

    const confirmDelete = (id) => {
        showConfirm(
            t('manageUsers.confirm'),
            t('manageUsers.deleteQuestion'),
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

    const renderItem = ({item}) => (
        <View style={[styles.manageUsersItem, {backgroundColor: colors.card}]}>
            <View style={styles.manageUsersItemInfo}>
                <Text style={[styles.manageUsersItemName, {color: colors.text}]} numberOfLines={1}>
                    {item.nombre}
                </Text>
                <Text style={[styles.manageUsersItemMeta, {color: colors.textSecondary}]} numberOfLines={1}>
                    {tab === 'students'
                        ? `${item.grado || ''} • ${item.email || ''}`
                        : `${item.materia || ''} • ${item.email || ''}`}
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
                    style={[styles.manageUsersActionButton, {borderColor: '#E53935'}]}
                    onPress={() => confirmDelete(item.id)}
                >
                    <Text style={[styles.manageUsersActionText, {color: '#E53935'}]}>
                        {t('common.delete')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

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
                            if (tab === 'students') {
                                addStudentById(item.id);
                            } else {
                                addTeacher(item);
                            }
                            closeModal();
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
                            {t('common.add')}
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
                <PrimaryButton title={t('common.save')} onPress={handleSave}/>
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
                <View style={styles.manageUsersHeader}>
                    <Text style={[styles.manageUsersTitle, {color: colors.text}]}>
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

                <View style={styles.manageUsersButtonContainer}>
                    <PrimaryButton title={t('common.back')} onPress={handleBack}/>
                </View>

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
                                {modalMode === 'searchAdd' ? renderSearchAddContent() : renderEditContent()}
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

