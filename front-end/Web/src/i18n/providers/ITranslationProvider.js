// ============================================================
//  FaceAttend EDU — ITranslationProvider (i18n · Provider)
//
//  Contrato que debe cumplir cualquier motor de traducción.
//  LibreTranslate, DeepL, OpenAI u otro implementan esta interfaz.
//  El resto de la app NUNCA importa el motor directamente.
// ============================================================

import { LanguageCode, TranslationResult } from "../models/TranslationEntry";
