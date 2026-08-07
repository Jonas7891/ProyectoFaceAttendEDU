import React, {useState} from 'react';
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    TextInput,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../components/common/ThemeContext';
import {useCustomAlert} from '../components/common/useCustomAlert';
import CustomAlert from '../components/common/CustomAlert';
import PrimaryButton from '../components/auth/PrimaryButton';
import BottomBar from '../components/common/NavigationBar';
import styles from "./Style";
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
    const [modalMode, setModalMode] = useState(null); // 'add' | 'edit'
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

    // Estilo reforzado para los inputs: fondo propio + borde más marcado,
    // así se distinguen bien del contenedor tanto en tema claro como oscuro.
    const inputFieldStyle = [
        styles.input,
        {
            color: colors.text,
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1.5,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        },
    ];

    const fieldLabelStyle = {
        color: colors.text,
        fontWeight: '600',
        fontSize: 13,
        marginBottom: 6,
        marginTop: 12,
        letterSpacing: 0.2,
    };

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

        setModalVisible(false);
        setModalMode(null);
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
        <View style={[styles.item, {backgroundColor: colors.card}]}>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, {color: colors.text}]}>
                    {item.nombre}
                </Text>
                <Text style={[styles.itemMeta, {color: colors.textSecondary}]}>
                    {`${item.tipo || ''} • ${item.ubicacion || ''} • Cap. ${item.capacidad || '-'}`}
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

    const renderFormModal = () => (
        <>
            <Text style={[styles.modalTitle, {color: colors.text, marginBottom: 4}]}>
                {modalMode === 'edit'
                    ? t('manageAmbientes.editAmbiente', {defaultValue: 'Editar ambiente'})
                    : t('manageAmbientes.newAmbiente', {defaultValue: 'Nuevo ambiente de formación'})}
            </Text>
            <View style={{height: 1, backgroundColor: colors.border, marginBottom: 4, opacity: 0.6}}/>

            <Text style={fieldLabelStyle}>
                {t('manageAmbientes.name', {defaultValue: 'Nombre'})}
            </Text>
            <TextInput
                placeholder={t('manageAmbientes.namePlaceholder', {defaultValue: 'Ej: Sala 301'})}
                placeholderTextColor={colors.textSecondary}
                style={inputFieldStyle}
                value={form.nombre}
                onChangeText={(text) => setForm((f) => ({...f, nombre: text}))}
            />

            <Text style={fieldLabelStyle}>
                {t('manageAmbientes.location', {defaultValue: 'Ubicación'})}
            </Text>
            <TextInput
                placeholder={t('manageAmbientes.locationPlaceholder', {defaultValue: 'Ej: Bloque A, Piso 3'})}
                placeholderTextColor={colors.textSecondary}
                style={inputFieldStyle}
                value={form.ubicacion}
                onChangeText={(text) => setForm((f) => ({...f, ubicacion: text}))}
            />

            <Text style={fieldLabelStyle}>
                {t('manageAmbientes.capacity', {defaultValue: 'Capacidad'})}
            </Text>
            <TextInput
                placeholder={t('manageAmbientes.capacityPlaceholder', {defaultValue: 'Ej: 35'})}
                placeholderTextColor={colors.textSecondary}
                style={inputFieldStyle}
                value={String(form.capacidad ?? '')}
                onChangeText={(text) => setForm((f) => ({...f, capacidad: text.replace(/[^0-9]/g, '')}))}
                keyboardType="numeric"
            />

            <Text style={fieldLabelStyle}>
                {t('manageAmbientes.type', {defaultValue: 'Tipo'})}
            </Text>
            <TextInput
                placeholder={t('manageAmbientes.typePlaceholder', {defaultValue: 'Aula, Laboratorio, Taller...'})}
                placeholderTextColor={colors.textSecondary}
                style={inputFieldStyle}
                value={form.tipo}
                onChangeText={(text) => setForm((f) => ({...f, tipo: text}))}
            />

            <View style={[styles.modalActions, {marginTop: 20}]}>
                <PrimaryButton title={t('common.save')} onPress={handleSave}/>
                <TouchableOpacity
                    style={[styles.cancelButton, {borderColor: colors.border, marginTop: 8}]}
                    onPress={() => {
                        Keyboard.dismiss();
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>

                <View style={styles.headerManage}>
                    <Text style={[styles.titleManage, {color: colors.text}]}>
                        {t('manageAmbientes.title', {defaultValue: 'Gestión de Ambientes de Formación'})}
                    </Text>
                </View>

                {/* Buscador opcional para filtrar ambientes ya creados */}
                <View style={{marginHorizontal: 20, marginTop: 15}}>
                    <TextInput
                        placeholder={t('manageAmbientes.searchPlaceholder', {defaultValue: 'Buscar ambiente...'})}
                        placeholderTextColor={colors.textSecondary}
                        style={inputFieldStyle}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                <View style={styles.actionsRow}>
                    <PrimaryButton
                        title={t('manageAmbientes.addAmbiente', {defaultValue: 'Agregar Ambiente'})}
                        onPress={openAdd}
                    />
                </View>

                <FlatList
                    data={searchQuery ? searchResults : ambientes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={() => (
                        <View style={styles.empty}>
                            <Text style={{color: colors.textSecondary}}>
                                {t('manageAmbientes.noRecords', {defaultValue: 'No hay ambientes registrados'})}
                            </Text>
                        </View>
                    )}
                />

                <Modal visible={modalVisible} animationType="slide" transparent>
                    <KeyboardAvoidingView
                        style={{flex: 1}}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modalWrapper}>
                                <TouchableWithoutFeedback>
                                    <View
                                        style={[
                                            styles.modal,
                                            {
                                                backgroundColor: colors.card,
                                                borderWidth: 1,
                                                borderColor: colors.border,
                                            },
                                        ]}
                                    >
                                        {renderFormModal()}
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </Modal>

                <View style={styles.buttonContainer}>
                    <PrimaryButton title={t('consultJustify.back')} onPress={handleBack}/>
                </View>

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