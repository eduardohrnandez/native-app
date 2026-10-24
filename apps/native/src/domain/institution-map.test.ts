import { describe, expect, it } from "@jest/globals";

import {
    INSTALLMENT_REGIONS,
    installmentAppsIn,
    installmentRegion,
    searchInstallmentApps,
    suggestInstitutions,
    isInstallmentAppAccount,
    resolveInstitutionDomain,
} from "./institution-map";
import { merchantKey } from "./merchant-resolver";

describe("resolveInstitutionDomain", () => {
    it("folds punctuation and accents the way merchantKey does", () => {
        expect(resolveInstitutionDomain(merchantKey("U.S. Bank"))).toBe("usbank.com");
        expect(resolveInstitutionDomain(merchantKey("Itaú"))).toBe("itau.com.br");
        expect(resolveInstitutionDomain(merchantKey("100% Banco"))).toBe("100x100banco.com");
    });

    it("matches an institution named inside a longer account name", () => {
        expect(resolveInstitutionDomain(merchantKey("Chase Sapphire Reserve"))).toBe("chase.com");
        expect(resolveInstitutionDomain(merchantKey("Ahorros Banesco"))).toBe("banesco.com");
    });

    it("lets the more specific name win over the shorter one it contains", () => {
        expect(resolveInstitutionDomain(merchantKey("BBVA"))).toBe("bbva.com");
        expect(resolveInstitutionDomain(merchantKey("BBVA Provincial"))).toBe("provincial.com");
    });

    it("resolves installment companies, and the more specific name wins over the one it contains", () => {
        expect(resolveInstitutionDomain(merchantKey("Cashea"))).toBe("cashea.app");
        expect(resolveInstitutionDomain(merchantKey("Addi cupo"))).toBe("addi.com");
        expect(resolveInstitutionDomain(merchantKey("Mercado Crédito"))).toBe("mercadopago.com");
        expect(resolveInstitutionDomain(merchantKey("Cash App Afterpay"))).toBe("afterpay.com");
        expect(resolveInstitutionDomain(merchantKey("Cash App"))).toBe("cash.app");
    });

    it("does not brand a bare zip or alma", () => {
        expect(resolveInstitutionDomain(merchantKey("Zip"))).toBeNull();
        expect(resolveInstitutionDomain(merchantKey("Alma"))).toBeNull();
        expect(resolveInstitutionDomain(merchantKey("Zip Pay"))).toBe("zip.co");
    });

    it("answers nothing for a name no institution covers", () => {
        expect(resolveInstitutionDomain(merchantKey("Cash"))).toBeNull();
        expect(resolveInstitutionDomain(merchantKey("Vacation fund"))).toBeNull();
        expect(resolveInstitutionDomain("")).toBeNull();
    });

    it("does not answer for a near-miss spelling", () => {
        expect(resolveInstitutionDomain(merchantKey("Chace"))).toBeNull();
    });
});

describe("installmentAppsIn", () => {
    it("offers a region's installment apps and nothing for a region without any", () => {
        const apps = (code: string | undefined) => installmentAppsIn(installmentRegion(code));
        expect(apps("ve").map((app) => app.label)).toStrictEqual(["Cashea", "Krece", "Lysto", "Chollo"]);
        expect(apps("MX").map((app) => app.id)).toStrictEqual(["kueski-pay", "aplazo", "coppel"]);
        expect(apps("AR")).toStrictEqual([]);
        expect(apps(undefined)).toStrictEqual([]);
    });
});

describe("searchInstallmentApps", () => {
    it("finds an app from any country, quoted where the person lives when it is sold there", () => {
        const found = (query: string, region: string) =>
            searchInstallmentApps(query, installmentRegion(region)).map((app) => [
                app.label,
                app.currency,
                app.regions[0],
            ]);
        expect(found("cash", "US")).toStrictEqual([["Cashea", "USD", "VE"]]);
        expect(found("klar", "DE")).toStrictEqual([["Klarna", "EUR", "DE"]]);
        expect(found("klar", "VE")).toStrictEqual([["Klarna", "USD", "US"]]);
        expect(found("Kueski", "AR")).toStrictEqual([["Kueski Pay", "MXN", "MX"]]);
        expect(found("  ", "VE")).toStrictEqual([]);
    });

    it("lists the apps sold where the person lives first", () => {
        expect(searchInstallmentApps("a", "VE")[0]?.regions[0]).toBe("VE");
    });
});

describe("isInstallmentAppAccount", () => {
    it("knows every account the picker makes for an installment app, by the label it names it with", () => {
        const unknown = INSTALLMENT_REGIONS.flatMap(installmentAppsIn)
            .filter((app) => !isInstallmentAppAccount({ kind: "liability", name: app.label }))
            .map((app) => app.label);
        expect(unknown).toStrictEqual([]);
    });

    it("knows an app by a longer name, and only as a liability", () => {
        expect(isInstallmentAppAccount({ kind: "liability", name: "Cashea USD" })).toBe(true);
        expect(isInstallmentAppAccount({ kind: "asset", name: "Klarna" })).toBe(false);
        expect(isInstallmentAppAccount({ kind: "liability", name: "Chase Sapphire" })).toBe(false);
    });
});

describe("suggestInstitutions", () => {
    it("lists every Venezuelan bank for a bolívar account before anything is typed", () => {
        const names = suggestInstitutions("", "VES", 8);
        expect(names).toContain("Banesco");
        expect(names).toContain("Banco de Venezuela");
        expect(names).not.toContain("Chase");
        expect(names.length).toBeGreaterThan(8);
    });

    it("offers the dollar apps, not the bolívar banks, for an empty dollar account", () => {
        const names = suggestInstitutions("", "USD", 8);
        expect(names).toContain("Zelle");
        expect(names).toContain("Towerbank");
        expect(names).not.toContain("Banesco");
    });

    it("puts the currency's own banks first once a name is typed", () => {
        expect(suggestInstitutions("ban", "VES", 3)[0]).not.toBe("Bank of America");
        expect(suggestInstitutions("tower", "USD", 8)).toStrictEqual(["Towerbank"]);
    });

    it("stops offering a name once it is typed in full", () => {
        expect(suggestInstitutions("Banesco", "VES", 8)).not.toContain("Banesco");
    });
});

describe("venezuelan bank names", () => {
    it("brand the bank's own domain, and a shop that only shares a word stays unbranded", () => {
        expect(resolveInstitutionDomain(merchantKey("Bicentenario"))).toBe("bdt.com.ve");
        expect(resolveInstitutionDomain(merchantKey("Pago móvil BNC"))).toBe("bncenlinea.com");
        expect(resolveInstitutionDomain(merchantKey("Farmacia del Sur"))).toBeNull();
    });
});
