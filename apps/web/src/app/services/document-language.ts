import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';

/** UI language codes that are not valid BCP 47 tags. */
const DOCUMENT_LANGUAGE_OVERRIDES: Readonly<Record<string, string>> = {
    by: 'be',
    pt: 'pt-BR',
    'pt-br': 'pt-BR',
    'pt-pt': 'pt-PT',
    zhtw: 'zh-TW',
};

/**
 * Maps an app language code to the value for `<html lang>`. The browser uses
 * it for font fallback (Han variants), hyphenation and locale-aware
 * `text-transform` (Turkish dotted İ, Greek accents in uppercase labels).
 */
export function toDocumentLanguage(appLanguage?: string | null): string {
    const code = appLanguage?.trim().replace(/_/g, '-');
    if (!code) {
        return 'en';
    }
    return DOCUMENT_LANGUAGE_OVERRIDES[code.toLowerCase()] ?? code;
}

/** Arabic UI languages render right-to-left; all other supported locales use LTR. */
export function toDocumentDirection(appLanguage?: string | null): 'rtl' | 'ltr' {
    const code = appLanguage?.trim().replace(/_/g, '-').toLowerCase();
    return code === 'ar' || code === 'ary' ? 'rtl' : 'ltr';
}

/**
 * Keeps `<html lang>` and `<html dir>` in step with the language the UI
 * renders, whichever code path switches it (startup, settings).
 * Must run in an injection context.
 */
export function syncDocumentLanguage(): void {
    const document = inject(DOCUMENT);
    const translate = inject(TranslateService);
    const apply = (): void => {
        const language = translate.currentLang || translate.getDefaultLang();
        document.documentElement.lang = toDocumentLanguage(language);
        document.documentElement.dir = toDocumentDirection(language);
    };

    apply();
    merge(translate.onLangChange, translate.onDefaultLangChange)
        .pipe(takeUntilDestroyed(inject(DestroyRef)))
        .subscribe(apply);
}
