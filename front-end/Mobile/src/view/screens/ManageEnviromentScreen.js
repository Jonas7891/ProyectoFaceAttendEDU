import React, {useState} from 'react';
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
import {useManageEnvironmentViewModel} from '../../viewmodels/useManageEnvironmentViewModel';

export default function ManageEnviromentScreen({navigation, userRole}) {
    const {t} = useTranslation();
    const {colors} = useTheme();
    const {alertConfig, hideAlert, showError, showConfirm} = useCustomAlert();

    const {
        ambientes,
        searchAmbientes,
        addAmbiente,
        updateAmbiente,
        deleteAmbiente,
    } = useManageEnvironmentViewModel();

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        nombre: '',
        ubicacion: '',
        capacidad: '',
        tipo: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const emptyForm = {nombre: '', ubicacion: '', capacidad: '', tipo: ''};

    const openAdd = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalMode('add');
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

    // Si el teclado está abierto, el primer toque fuera solo cierra el teclado.
    // Si ya está cerrado, entonces cierra el modal.
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
            showError(t('manageAmbientes.validation'), t('manageAmbientes.nameRequired'));
            return;
        }
        if (!form.ubicacion) {
            showError(t('manageAmbientes.validation'), t('manageAmbientes.locationRequired'));
            return;
        }

        if (modalMode === 'edit') {
            updateAmbiente({...editing, ...form});
        } else {
            addAmbiente({...form});
        }

        closeModal();
    };

    const confirmDelete = (id) => {
        showConfirm(
            t('manageAmbientes.confirm'),
            t('manageAmbientes.deleteQuestion'),
            () => {
                deleteAmbiente(id);
            }
        );
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        setSearchResults(searchAmbientes ? searchAmbientes(text) : []);
    };

    const handleBack = () => navigation.goBack();

    const renderItem = ({item}) => (
        <View style={[styles.manageEnvironmentItem, {backgroundColor: colors.card}]}>
            <View style={styles.manageEnvironmentItemInfo}>
                <Text style={[styles.manageEnvironmentItemName, {color: colors.text}]} numberOfLines={1}>
                    {item.nombre}
                </Text>
                <Text style={[styles.manageEnvironmentItemMeta, {color: colors.textSecondary}]} numberOfLines={1}>
                    {`${item.tipo || ''} • ${item.ubicacion || ''} • Cap. ${item.capacidad || '-'}`}
                </Text>
            </View>
            <View style={styles.manageEnvironmentItemActions}>
                <TouchableOpacity
                    style={[styles.manageEnvironmentActionButton, {borderColor: colors.primary}]}
                    onPress={() => openEdit(item)}
                >
                    <Text style={[styles.manageEnvironmentActionText, {color: colors.primary}]}>
                        {t('common.edit')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.manageEnvironmentActionButton, {borderColor: '#E53935'}]}
                    onPress={() => confirmDelete(item.id)}
                >
                    <Text style={[styles.manageEnvironmentActionText, {color: '#E53935'}]}>
                        {t('common.delete')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderFormFields = () => (
        <>
            <View style={[styles.manageEnvironmentSheetHandle, {backgroundColor: colors.border}]}/>

            <Text style={[styles.manageEnvironmentModalTitle, {color: colors.text}]}>
                {modalMode === 'edit'
                    ? t('manageAmbientes.editAmbiente')
                    : t('manageAmbientes.newAmbiente')}
            </Text>
            <View style={[styles.manageEnvironmentDivider, {backgroundColor: colors.border}]}/>

            <Text style={[styles.manageEnvironmentFieldLabel, {color: colors.text}]}>
                {t('manageAmbientes.name')}
            </Text>
            <TextInput
                placeholder={t('manageAmbientes.namePlaceholder')}
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageEnvironmentInput, {
                    color: colors.text,
                    backgroundColor: colors.modalInputBackground,
                    borderColor: colors.modalBorder,
                }]}
                value={form.nombre}
                onChangeText={(text) => setForm((f) => ({...f, nombre: text}))}
            />

            <Text style={[styles.manageEnvironmentFieldLabel, {color: colors.text}]}>
                {t('manageAmbientes.location')}
            </Text>
            <TextInput
                placeholder={t('manageAmbientes.locationPlaceholder')}
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageEnvironmentInput, {
                    color: colors.text,
                    backgroundColor: colors.modalInputBackground,
                    borderColor: colors.modalBorder,
                }]}
                value={form.ubicacion}
                onChangeText={(text) => setForm((f) => ({...f, ubicacion: text}))}
            />

            <Text style={[styles.manageEnvironmentFieldLabel, {color: colors.text}]}>
                {t('manageAmbientes.capacity')}
            </Text>
            <TextInput
                placeholder={t('manageAmbientes.capacityPlaceholder')}
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageEnvironmentInput, {
                    color: colors.text,
                    backgroundColor: colors.modalInputBackground,
                    borderColor: colors.modalBorder,
                }]}
                value={String(form.capacidad ?? '')}
                onChangeText={(text) => setForm((f) => ({...f, capacidad: text.replace(/[^0-9]/g, '')}))}
                keyboardType="numeric"
            />

            <Text style={[styles.manageEnvironmentFieldLabel, {color: colors.text}]}>
                {t('manageAmbientes.type')}
            </Text>
            <TextInput
                placeholder={t('manageAmbientes.typePlaceholder')}
                placeholderTextColor={colors.modalInputPlaceholder}
                style={[styles.manageEnvironmentInput, {
                    color: colors.text,
                    backgroundColor: colors.modalInputBackground,
                    borderColor: colors.modalBorder,
                }]}
                value={form.tipo}
                onChangeText={(text) => setForm((f) => ({...f, tipo: text}))}
            />

            <View style={styles.manageEnvironmentModalActions}>
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
                    style={[styles.manageEnvironmentCancelButton, {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                    }]}
                    onPress={closeModal}
                >
                    <Text style={styles.manageEnvironmentCancelButtonText}>
                        {t('common.cancel')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={[styles.manageEnvironmentContainer, {backgroundColor: colors.background}]}>
                <View style={styles.manageEnvironmentHeader}>
                    <Text style={[styles.manageEnvironmentTitle, {color: colors.text}]}>
                        {t('manageAmbientes.title')}
                    </Text>
                </View>

                <View style={styles.manageEnvironmentSearchContainer}>
                    <TextInput
                        placeholder={t('manageAmbientes.searchPlaceholder')}
                        placeholderTextColor={colors.modalInputPlaceholder}
                        style={[styles.manageEnvironmentInput, {
                            color: colors.text,
                            backgroundColor: colors.cardBorder,
                            borderColor: colors.modalBorder,
                        }]}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                <View style={styles.manageEnvironmentActionsRow}>
                    <PrimaryButton
                        title={t('manageAmbientes.addAmbiente')}
                        onPress={openAdd}
                    />
                </View>

                <FlatList
                    data={searchQuery ? searchResults : ambientes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.manageEnvironmentList}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={() => (
                        <View style={styles.manageEnvironmentEmpty}>
                            <Text style={[styles.manageEnvironmentEmptyText, {color: colors.textSecondary}]}>
                                {t('manageAmbientes.noRecords')}
                            </Text>
                        </View>
                    )}
                />

                <View style={styles.manageEnviromentButtonContainer}>
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
                        style={styles.manageEnvironmentKav}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View style={styles.manageEnvironmentOverlay}>
                            {/* Fondo oscuro: hermano del sheet, no padre.
                                Así los toques dentro del formulario no lo atraviesan. */}
                            <Pressable style={styles.manageEnvironmentBackdrop} onPress={handleBackdropPress}/>

                            <ScrollView
                                style={[styles.manageEnvironmentSheet, {backgroundColor: colors.card}]}
                                contentContainerStyle={styles.manageEnvironmentSheetContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={true}
                                bounces={false}
                            >
                                {renderFormFields()}
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