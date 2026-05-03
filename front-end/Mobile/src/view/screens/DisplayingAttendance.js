import React from 'react';
import {
    Text,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Platform,
    Modal,
} from 'react-native';
import styles from './Style';
import BottomBar from '../components/common/NavigationBar';
import CustomTabs from '../components/common/CustomTabs';
import { useTranslation } from 'react-i18next';
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import { useTheme } from '../components/common/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDisplayingAttendanceViewModel } from '../../viewmodels/useDisplayingAttendanceViewModel';

// Componentes auxiliares (StatusBadge, DetailRow, SectionLabel,
// TeacherDetailModal, StudentDetailModal, TeacherCard, MyAttendanceCard)
// se mantienen igual, solo reciben props.

// ... (copia aquí los componentes auxiliares exactamente como los tienes)

export default function DisplayingAttendance() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const refreshKey = useLanguageRefresh();

    const {
        userRole,
        isAdmin,
        searchText,
        setSearchText,
        selectedDate,
        tempDate,
        showPicker,
        showIOSModal,
        showDetailModal,
        detailItem,
        updateKey,
        isDark,
        activeData,
        openDetail,
        closeDetail,
        handleOpenPicker,
        handleAndroidChange,
        handleClearDate,
        confirmIOSDate,
        cancelIOSDate,
        setTempDate,
    } = useDisplayingAttendanceViewModel();

    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: colors.background }]}
            key={`${refreshKey}-${updateKey}`}
        >
            <View style={{
                flex: 1,
                backgroundColor: colors.background,
                marginTop: Platform.OS === 'ios' ? 15 : 10
            }}>
                <CustomTabs userRole={userRole} />

                {/* Búsqueda + fecha */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10, marginHorizontal: 20, marginTop: 20 }}>
                    {isAdmin && (
                        <View style={{
                            flex: 2,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.inputBackground,
                            borderWidth: 1.5,
                            borderColor: searchText ? colors.primary : (colors.separator ?? '#E0E0E0'),
                            borderRadius: 10,
                            paddingHorizontal: 12,
                        }}>
                            <TextInput
                                style={{ flex: 1, paddingVertical: 10, color: colors.text, fontSize: 14 }}
                                placeholder={t('attendance.searchByName', { defaultValue: 'Buscar docente...' })}
                                placeholderTextColor={colors.textMuted}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            {searchText ? (
                                <TouchableOpacity onPress={() => setSearchText('')}>
                                    <Text style={{ color: colors.danger, fontSize: 16, fontWeight: '700' }}>✕</Text>
                                </TouchableOpacity>
                            ) : (
                                <Image source={require('../../assets/images/lupa2.png')}
                                       style={{ width: 16, height: 16, tintColor: colors.textMuted }} />
                            )}
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleOpenPicker}
                        style={{
                            flex: isAdmin ? 1.2 : 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.inputBackground,
                            borderWidth: 1.5,
                            borderColor: selectedDate ? colors.primary : (colors.separator ?? '#E0E0E0'),
                            borderRadius: 10,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            gap: 6,
                        }}
                    >
                        <Text style={{ fontSize: 15 }}>📅</Text>
                        <Text style={{ flex: 1, color: selectedDate ? colors.text : colors.textMuted, fontSize: 13 }}
                              numberOfLines={1}>
                            {selectedDate
                                ? selectedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                                : t('attendance.filterByDate', { defaultValue: 'Filtrar fecha' })}
                        </Text>
                        {selectedDate && (
                            <TouchableOpacity onPress={handleClearDate}
                                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={{ color: colors.danger, fontSize: 16, fontWeight: '700' }}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Pickers de fecha (Android e iOS) */}
                {showPicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="default"
                        onChange={handleAndroidChange}
                        maximumDate={new Date()}
                    />
                )}

                <Modal transparent visible={showIOSModal} animationType="slide"
                       onRequestClose={cancelIOSDate}>
                    <TouchableOpacity activeOpacity={1} onPress={cancelIOSDate}
                                      style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} />
                    <View style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
                        padding: 16, paddingBottom: 34,
                    }}>
                        <View style={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: colors.separator ?? '#E0E0E0',
                            alignSelf: 'center',
                            marginBottom: 14
                        }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <TouchableOpacity onPress={cancelIOSDate}>
                                <Text style={{ color: colors.danger, fontSize: 16, fontWeight: '600' }}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmIOSDate}>
                                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
                                    {t('common.accept')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display="spinner"
                            onChange={(_, date) => date && setTempDate(date)}
                            maximumDate={new Date()}
                            style={{ backgroundColor: colors.card }}
                            textColor={colors.text}
                        />
                    </View>
                </Modal>

                {/* Lista */}
                <FlatList
                    data={activeData}
                    keyExtractor={item => item.id.toString()}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
                    renderItem={({ item }) =>
                        isAdmin
                            ? <TeacherCard item={item} colors={colors} t={t} isDark={isDark} onInfo={openDetail} />
                            : <MyAttendanceCard item={item} colors={colors} t={t} isDark={isDark} onInfo={openDetail} />
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', paddingVertical: 50 }}>
                            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
                            <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                                {t('attendance.noResults', { defaultValue: 'Sin resultados para los filtros aplicados' })}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={<View style={{ paddingBottom: Platform.OS === 'ios' ? 50 : 70 }} />}
                />
            </View>

            <BottomBar />

            {/* Modales de detalle */}
            {isAdmin ? (
                <TeacherDetailModal
                    item={detailItem}
                    visible={showDetailModal}
                    onClose={closeDetail}
                    colors={colors}
                    t={t}
                    isDark={isDark}
                />
            ) : (
                <StudentDetailModal
                    item={detailItem}
                    visible={showDetailModal}
                    onClose={closeDetail}
                    colors={colors}
                    t={t}
                    isDark={isDark}
                />
            )}
        </SafeAreaView>
    );
}