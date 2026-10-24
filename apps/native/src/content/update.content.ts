import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const update = {
    content: {
        "update.check.available": t({ en: "New version found", es: "Hay una versión nueva" }),
        "update.check.checking": t({ en: "Checking…", es: "Buscando…" }),
        "update.check.current": t({ en: "You're up to date", es: "Estás al día" }),
        "update.check.failed": t({ en: "Couldn't check, try again", es: "No se pudo revisar, inténtalo de nuevo" }),
        "update.check.title": t({ en: "Check for updates", es: "Buscar actualizaciones" }),
        "update.check.version": t({ en: "Version {build}", es: "Versión {build}" }),
        "update.availableBody": t({
            en: "A new version of Finta is ready. Download it and install it over this one; your data stays.",
            es: "Hay una versión nueva de Finta. Descárgala e instálala encima de esta; tus datos se quedan.",
        }),
        "update.availableTitle": t({
            en: "Update available",
            es: "Hay una actualización",
        }),
        "update.download": t({
            en: "Download",
            es: "Descargar",
        }),
        "update.failed": t({
            en: "The update did not install. Try again.",
            es: "La actualización no se instaló. Inténtalo de nuevo.",
        }),
        "update.later": t({
            en: "Later",
            es: "Después",
        }),
        "update.meta": t({
            en: "Update · {version} · {date}",
            es: "Actualización · {version} · {date}",
        }),
        "update.now": t({
            en: "Update now",
            es: "Actualizar ahora",
        }),
        "update.title": t({
            en: "What's new",
            es: "Novedades",
        }),
        "update.updating": t({
            en: "Updating, the app restarts when it is done",
            es: "Actualizando, la app se reinicia al terminar",
        }),
    },
    key: "update" as const,
} satisfies Dictionary;

export default update;
