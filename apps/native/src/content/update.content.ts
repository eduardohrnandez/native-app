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
            en: "A new version of Finta is ready. It installs over this one and your data stays.",
            es: "Hay una versión nueva de Finta. Se instala encima de esta y tus datos se quedan.",
        }),
        "update.availableTitle": t({
            en: "Update available",
            es: "Hay una actualización",
        }),
        "update.downloading": t({ en: "Downloading the update", es: "Descargando la actualización" }),
        "update.downloadingBody": t({
            en: "Android's installer opens when it is done. The first time, allow Finta to install apps.",
            es: "Al terminar se abre el instalador de Android. La primera vez, permite que Finta instale apps.",
        }),
        "update.check.progress": t({ en: "Downloading {percent}%", es: "Descargando {percent} %" }),
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
