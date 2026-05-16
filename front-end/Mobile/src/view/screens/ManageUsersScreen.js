import React, {useState, useEffect} from 'react';
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../components/common/ThemeContext';
import { useCustomAlert } from '../components/common/useCustomAlert';
import CustomAlert from '../components/common/CustomAlert';
import PrimaryButton from '../components/auth/PrimaryButton';
import BottomBar from '../components/common/NavigationBar';
import styles from "./Style";
import {useManageUsersViewModel} from '../../viewmodels/useManageUsersViewModel';

export default function ManageUsersScreen({navigation, userRole, onLogout}) {
    const {t} = useTranslation();
    const {colors, theme, toggleTheme} = useTheme();
    const { alertConfig, hideAlert, showError, showConfirm } = useCustomAlert();

    const {
        allStudents,
        students,
        teachers,
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

    const handleSave = () => {
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
        setModalVisible(false);
        setModalMode(null);
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
        <View style={[styles.item, {backgroundColor: colors.card}]}>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, {color: colors.text}]}>
                    {item.nombre}
                </Text>
                <Text style={[styles.itemMeta, {color: colors.textSecondary}]}>
                    {tab === 'students'
                        ? `${item.grado || ''} • ${item.email || ''}`
                        : `${item.materia || ''} • ${item.email || ''}`}
                </Text>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openEdit(item)}>
                    <Text style={[styles.actionText, {color: colors.primary}]}>
                        {t('common.edit')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => confirmDelete(item.id)}>
                    <Text style={[styles.actionText, {color: '#E53935'}]}>
                        {t('common.delete')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSearchAddModal = () => (
        <>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
                {tab === 'students'
                    ? t('manageUsers.searchStudent')
                    : t('manageUsers.searchTeacher', {defaultValue: 'Buscar profesor'})}
            </Text>

            <TextInput
                placeholder={
                    tab === 'students'
                        ? t('manageUsers.enterStudentName')
                        : t('manageUsers.enterTeacherName', {defaultValue: 'Nombre del profesor...'})
                }
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                value={searchQuery}
                onChangeText={handleSearch}
            />

            <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <View style={[styles.searchItem, {borderColor: colors.border}]}>
                        <View style={{flex: 1}}>
                            <Text style={{color: colors.text, fontWeight: '600'}}>
                                {item.nombre}
                            </Text>
                            <Text style={{color: colors.textSecondary}}>
                                {tab === 'students'
                                    ? `${item.grado} • ${item.email}`
                                    : `${item.materia} • ${item.email}`}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                if (tab === 'students') {
                                    addStudentById(item.id);
                                } else {
                                    addTeacher(item);
                                }
                                setModalVisible(false);
                                setModalMode(null);
                            }}
                        >
                            <Text style={{color: colors.primary}}>
                                {t('common.add')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={{padding: 12}}>
                        <Text style={{color: colors.textSecondary}}>
                            {tab === 'students'
                                ? t('manageUsers.enterNameToSearch')
                                : t('manageUsers.enterNameToSearch')}
                        </Text>
                    </View>
                )}
            />

            <View style={styles.modalActions}>
                <TouchableOpacity
                    style={[styles.cancelButtonManage, {borderColor: colors.border}]}
                    onPress={() => {
                        setModalVisible(false);
                        setModalMode(null);
                    }}
                >
                    <Text style={{color: colors.textSecondary}}>
                        {t('common.cancel')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    const renderEditModal = () => (
        <>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
                {editing ? t('manageUsers.editStudentInfo') : t('manageUsers.newRecord')}
            </Text>

            <Text style={{color: colors.text}}>{t('common.name')}</Text>
            <TextInput
                placeholder={t('common.name')}
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                value={form.nombre}
                onChangeText={(text) => setForm((f) => ({...f, nombre: text}))}
            />

            <Text style={{color: colors.text}}>{t('common.email')}</Text>
            <TextInput
                placeholder={t('common.email')}
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                value={form.email}
                onChangeText={(text) => setForm((f) => ({...f, email: text}))}
                keyboardType="email-address"
            />

            {tab === 'students' ? (
                <>
                    <Text style={{color: colors.text}}>{t('manageUsers.grade')}</Text>
                    <TextInput
                        placeholder={t('manageUsers.grade')}
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                        value={form.grado}
                        onChangeText={(text) => setForm((f) => ({...f, grado: text}))}
                    />
                </>
            ) : (
                <>
                    <Text style={{color: colors.text}}>{t('manageUsers.subject')}</Text>
                    <TextInput
                        placeholder={t('manageUsers.subject')}
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                        value={form.materia}
                        onChangeText={(text) => setForm((f) => ({...f, materia: text}))}
                    />
                </>
            )}

            <View style={styles.modalActions}>
                <PrimaryButton title={t('common.save')} onPress={handleSave}/>
                <TouchableOpacity
                    style={[styles.cancelButton, {borderColor: colors.border, marginTop: 5}]}
                    onPress={() => {
                        setModalVisible(false);
                        setModalMode(null);
                    }}
                >
                    <Text style={{color: colors.textSecondary}}>
                        {t('common.cancel')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>

            <View style={styles.headerManage}>
                <Text style={[styles.titleManage, {color: colors.text}]}>
                    {t('manageUsers.title')}
                </Text>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        tab === 'students' && {borderBottomColor: colors.primary, borderBottomWidth: 2},
                    ]}
                    onPress={() => setTab('students')}
                >
                    <Text style={{color: colors.text}}>{t('manageUsers.students')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        tab === 'teachers' && {borderBottomColor: colors.primary, borderBottomWidth: 2},
                    ]}
                    onPress={() => setTab('teachers')}
                >
                    <Text style={{color: colors.text}}>{t('manageUsers.teachers')}</Text>
                </TouchableOpacity>
            </View>

            {/* ✅ El botón ahora aparece en ambos tabs */}
            <View style={styles.actionsRow}>
                <PrimaryButton
                    title={
                        tab === 'students'
                            ? t('manageUsers.addStudent')
                            : t('manageUsers.addTeacher', {defaultValue: 'Agregar Profesor'})
                    }
                    onPress={openAdd}
                />
            </View>

            <FlatList
                data={tab === 'students' ? students : teachers}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <View style={styles.empty}>
                        <Text style={{color: colors.textSecondary}}>
                            {t('manageUsers.noRecords')}
                        </Text>
                    </View>
                )}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalWrapper}>
                    <View style={[styles.modal, {backgroundColor: colors.card}]}>
                        {modalMode === 'searchAdd' ? renderSearchAddModal() : renderEditModal()}
                    </View>
                </View>
            </Modal>

            <View style={styles.buttonContainer}>
                <PrimaryButton title={t('consultJustify.back')} onPress={handleBack}/>
            </View>

            <BottomBar/>
            
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
                type={alertConfig.type}
            />
        </SafeAreaView>
    );
}