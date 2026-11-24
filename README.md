# Tech Home TV

مشغل IPTV مستقل لأنظمة Windows وAndroid، مبني على مشروع IPTVnator مفتوح المصدر بترخيص MIT. لا يتضمن التطبيق قنوات أو قوائم تشغيل؛ أضف فقط المصادر التي تملك حق استخدامها.

## التنزيل

- [إصدارات Windows وAndroid](https://github.com/hm06601-crypto/tech-home-tv-v2/releases)
- [الموقع](https://techhome.ct.ws)

## التواصل

- هاتف العراق: [+964 774 464 4492](tel:+9647744644492)
- [WhatsApp](https://wa.me/9647744644492)

## التطوير والبناء

المصدر الأساسي من [4gray/iptvnator](https://github.com/4gray/iptvnator)، مع الاحتفاظ بترخيص MIT وإشعارات حقوق النشر الأصلية. هذه نسخة مستقلة ذات علامة Tech Home TV وليست إصداراً رسمياً من المشروع الأصلي.

- Windows: `pnpm install --frozen-lockfile`, ثم بناء تطبيق الويب والخلفية عبر Nx وتشغيل `pnpm run make:app`.
- Android TV / الهواتف والأجهزة اللوحية: راجع [دليل tv-shell](tv-shell/README.md) ومتطلبات Android SDK.
- الإصدار Android المنشور موقّع بمفتاح خاص مخزن في GitHub Actions Secrets. يجب الحفاظ على نسخة احتياطية آمنة من المفتاح لاستمرار تحديث APK المثبت.

القوائم ومصادر البث مسؤولية المستخدم. احرص على استخدام محتوى مرخص في بلدك.
