import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../components/common/ThemeContext';
import PrimaryButton from '../components/auth/PrimaryButton';
import BottomBar from '../components/common/NavigationBar';

import styles from "./Style";

import { useManageUsersViewModel } from '../../viewmodels/useManageUsersViewModel';

export default function ManageUsersScreen({
    navigation,
    userRole,
    onLogout,
}) {

    const { t } = useTranslation();

    const { colors, theme, toggleTheme } = useTheme();

    const {
        allStudents,
        students,
        teachers,
        searchStudents,
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

            Alert.alert(
                t('manageUsers.accessDenied'),
                t('manageUsers.onlyAdmins')
            );

            navigation.goBack();
        }

    }, [userRole, navigation]);

    const openAdd = () => {

        setEditing(null);

        setForm({
            nombre: '',
            email: '',
            grado: '',
            telefono: '',
            materia: '',
        });

        setSearchQuery('');

        setSearchResults([]);

        setModalMode('searchAdd');

        setModalVisible(true);
    };

    const openEdit = (item) => {

        setEditing(item);

        setForm({ ...item });

        setModalMode('edit');

        setModalVisible(true);
    };

    const handleSave = () => {

        if (!form.nombre) {

            Alert.alert(
                t('manageUsers.validation'),
                t('manageUsers.nameRequired')
            );

            return;
        }

        if (modalMode === 'edit') {

            if (tab === 'students') {

                updateStudent({
                    ...editing,
                    ...form,
                });

            } else {

                updateTeacher({
                    ...editing,
                    ...form,
                });
            }
        }

        setModalVisible(false);

        setModalMode(null);
    };

    const confirmDelete = (id) => {

        Alert.alert(
            t('manageUsers.confirm'),
            t('manageUsers.deleteQuestion'),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {

                        if (tab === 'students') {

                            deleteStudent(id);

                        } else {

                            deleteTeacher(id);
                        }
                    },
                },
            ]
        );
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const renderItem = ({ item }) => (

        <View
            style={[
                styles.item,
                {
                    backgroundColor: colors.card,
                },
            ]}
        >

            <View style={styles.itemInfo}>

                <Text
                    style={[
                        styles.itemName,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    {item.nombre}
                </Text>

                <Text
                    style={[
                        styles.itemMeta,
                        {
                            color: colors.textSecondary,
                        },
                    ]}
                >

                    {
                        tab === 'students'
                            ? `${item.grado || ''} • ${item.email || ''}`
                            : `${item.materia || ''} • ${item.email || ''}`
                    }

                </Text>

            </View>

            <View style={styles.itemActions}>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEdit(item)}
                >

                    <Text
                        style={[
                            styles.actionText,
                            {
                                color: colors.primary,
                            },
                        ]}
                    >
                        {t('common.edit')}
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => confirmDelete(item.id)}
                >

                    <Text
                        style={[
                            styles.actionText,
                            {
                                color: '#E53935',
                            },
                        ]}
                    >
                        {t('common.delete')}
                    </Text>

                </TouchableOpacity>

            </View>

        </View>
    );

    return (

        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >

            <View style={styles.headerManage}>

                <Text
                    style={[
                        styles.titleManage,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    {t('manageUsers.title')}
                </Text>

            </View>

            <View style={styles.tabs}>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        tab === 'students' && {
                            borderBottomColor: colors.primary,
                            borderBottomWidth: 2,
                        },
                    ]}
                    onPress={() => setTab('students')}
                >

                    <Text style={{ color: colors.text }}>
                        {t('manageUsers.students')}
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        tab === 'teachers' && {
                            borderBottomColor: colors.primary,
                            borderBottomWidth: 2,
                        },
                    ]}
                    onPress={() => setTab('teachers')}
                >

                    <Text style={{ color: colors.text }}>
                        {t('manageUsers.teachers')}
                    </Text>

                </TouchableOpacity>

            </View>

            <View style={styles.actionsRow}>

                {
                    tab === 'students' && (
                        <PrimaryButton
                            title={t('manageUsers.addStudent')}
                            onPress={openAdd}
                        />
                    )
                }

            </View>

            <FlatList
                data={tab === 'students' ? students : teachers}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (

                    <View style={styles.empty}>

                        <Text
                            style={{
                                color: colors.textSecondary,
                            }}
                        >
                            {t('manageUsers.noRecords')}
                        </Text>

                    </View>
                )}
            />

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
            >

                <View style={styles.modalWrapper}>

                    <View
                        style={[
                            styles.modal,
                            {
                                backgroundColor: colors.card,
                            },
                        ]}
                    >

                        {
                            modalMode === 'searchAdd'
                                ? (
                                    <>
                                        <Text
                                            style={[
                                                styles.modalTitle,
                                                {
                                                    color: colors.text,
                                                },
                                            ]}
                                        >
                                            {t('manageUsers.searchStudent')}
                                        </Text>

                                        <TextInput
                                            placeholder={t('manageUsers.enterStudentName')}
                                            placeholderTextColor={colors.textSecondary}
                                            style={[
                                                styles.input,
                                                {
                                                    color: colors.text,
                                                    borderColor: colors.border,
                                                },
                                            ]}
                                            value={searchQuery}
                                            onChangeText={(text) => {

                                                setSearchQuery(text);

                                                const results = searchStudents(text);

                                                setSearchResults(results);
                                            }}
                                        />

                                        <FlatList
                                            data={searchResults}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => (

                                                <View
                                                    style={[
                                                        styles.searchItem,
                                                        {
                                                            borderColor: colors.border,
                                                        },
                                                    ]}
                                                >

                                                    <View style={{ flex: 1 }}>

                                                        <Text
                                                            style={{
                                                                color: colors.text,
                                                                fontWeight: '600',
                                                            }}
                                                        >
                                                            {item.nombre}
                                                        </Text>

                                                        <Text
                                                            style={{
                                                                color: colors.textSecondary,
                                                            }}
                                                        >
                                                            {item.grado} • {item.email}
                                                        </Text>

                                                    </View>

                                                    <TouchableOpacity
                                                        onPress={() => {

                                                            addStudentById(item.id);

                                                            setModalVisible(false);

                                                            setModalMode(null);
                                                        }}
                                                    >

                                                        <Text
                                                            style={{
                                                                color: colors.primary,
                                                            }}
                                                        >
                                                            {t('common.add')}
                                                        </Text>

                                                    </TouchableOpacity>

                                                </View>
                                            )}
                                            ListEmptyComponent={() => (

                                                <View style={{ padding: 12 }}>

                                                    <Text
                                                        style={{
                                                            color: colors.textSecondary,
                                                        }}
                                                    >
                                                        {t('manageUsers.enterNameToSearch')}
                                                    </Text>

                                                </View>
                                            )}
                                        />

                                        <View style={styles.modalActions}>

                                            <TouchableOpacity
                                                style={[
                                                    styles.cancelButtonManage,
                                                    {
                                                        borderColor: colors.border,
                                                    },
                                                ]}
                                                onPress={() => {

                                                    setModalVisible(false);

                                                    setModalMode(null);
                                                }}
                                            >

                                                <Text
                                                    style={{
                                                        color: colors.textSecondary,
                                                    }}
                                                >
                                                    {t('common.cancel')}
                                                </Text>

                                            </TouchableOpacity>

                                        </View>
                                    </>
                                )
                                : (
                                    <>
                                        <Text
                                            style={[
                                                styles.modalTitle,
                                                {
                                                    color: colors.text,
                                                },
                                            ]}
                                        >

                                            {
                                                editing
                                                    ? t('manageUsers.editStudentInfo')
                                                    : t('manageUsers.newRecord')
                                            }

                                        </Text>

                                        <Text>{t('common.name')}</Text>

                                        <TextInput
                                            placeholder={t('common.name')}
                                            placeholderTextColor={colors.textSecondary}
                                            style={[
                                                styles.input,
                                                {
                                                    color: colors.text,
                                                    borderColor: colors.border,
                                                },
                                            ]}
                                            value={form.nombre}
                                            onChangeText={(text) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    nombre: text,
                                                }))
                                            }
                                        />

                                        <Text>{t('common.email')}</Text>

                                        <TextInput
                                            placeholder={t('common.email')}
                                            placeholderTextColor={colors.textSecondary}
                                            style={[
                                                styles.input,
                                                {
                                                    color: colors.text,
                                                    borderColor: colors.border,
                                                },
                                            ]}
                                            value={form.email}
                                            onChangeText={(text) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    email: text,
                                                }))
                                            }
                                            keyboardType="email-address"
                                        />

                                        {
                                            tab === 'students'
                                                ? (
                                                    <>
                                                        <Text>
                                                            {t('manageUsers.grade')}
                                                        </Text>

                                                        <TextInput
                                                            placeholder={t('manageUsers.grade')}
                                                            placeholderTextColor={colors.textSecondary}
                                                            style={[
                                                                styles.input,
                                                                {
                                                                    color: colors.text,
                                                                    borderColor: colors.border,
                                                                },
                                                            ]}
                                                            value={form.grado}
                                                            onChangeText={(text) =>
                                                                setForm((f) => ({
                                                                    ...f,
                                                                    grado: text,
                                                                }))
                                                            }
                                                        />
                                                    </>
                                                )
                                                : (
                                                    <><Text> {t('manageUsers.subject')} </Text><TextInput
                                                        placeholder={t('manageUsers.subject')}
                                                        placeholderTextColor={colors.textSecondary}
                                                        style={[
                                                            styles.input,
                                                            {
                                                                color: colors.text,
                                                                borderColor: colors.border,
                                                            },
                                                        ]}
                                                        value={form.materia}
                                                        onChangeText={(text) => setForm((f) => ({
                                                            ...f,
                                                            materia: text,
                                                        }))} /></>
                                                )
                                        }

                                        <View style={styles.modalActions}>

                                            <PrimaryButton
                                                title={t('common.save')}
                                                onPress={handleSave}
                                            />

                                            <TouchableOpacity
                                                style={[
                                                    styles.cancelButton,
                                                    {
                                                        borderColor: colors.border,
                                                        marginTop: 5,
                                                    },
                                                ]}
                                                onPress={() => {

                                                    setModalVisible(false);

                                                    setModalMode(null);
                                                }}
                                            >

                                                <Text
                                                    style={{
                                                        color: colors.textSecondary,
                                                    }}
                                                >
                                                    {t('common.cancel')}
                                                </Text>

                                            </TouchableOpacity>

                                        </View>
                                    </>
                                )
                        }

                    </View>

                </View>

            </Modal>

            <View style={styles.buttonContainer}>

                <PrimaryButton
                    title={t('consultJustify.back')}
                    onPress={handleBack}
                />

            </View>

            <BottomBar />

        </SafeAreaView>
    );
}