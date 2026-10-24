import { toAccountKind } from "@outlayr/money/account-kind";

import { merchantKey } from "./merchant-resolver";
import { buildPatternIndex, containsTokenSequence } from "./pattern-index";

// Account names only: in `resolveMerchant` these would suppress the model call for a payee named "Chase".
export const INSTALLMENT_REGIONS = [
    "AE",
    "AT",
    "AU",
    "CA",
    "CO",
    "DE",
    "ES",
    "FR",
    "GB",
    "IT",
    "JP",
    "MX",
    "NL",
    "NZ",
    "SA",
    "SE",
    "SG",
    "US",
    "VE",
] as const;

export type InstallmentRegion = (typeof INSTALLMENT_REGIONS)[number];

// Venezuela's apps quote in dollars and are paid in bolívares at BCV.
const INSTALLMENT_CURRENCIES: Readonly<Record<InstallmentRegion, string>> = {
    AE: "AED",
    AT: "EUR",
    AU: "AUD",
    CA: "CAD",
    CO: "COP",
    DE: "EUR",
    ES: "EUR",
    FR: "EUR",
    GB: "GBP",
    IT: "EUR",
    JP: "JPY",
    MX: "MXN",
    NL: "EUR",
    NZ: "NZD",
    SA: "SAR",
    SE: "SEK",
    SG: "SGD",
    US: "USD",
    VE: "USD",
};

interface InstitutionEntry {
    readonly domain: string;
    readonly id: string;
    readonly installmentsIn?: readonly InstallmentRegion[];
    readonly label: string;
    /** Already in `merchantKey` form; a pattern matches its token sequence anywhere in the name. */
    readonly patterns: readonly string[];
    /** Currencies these accounts are usually held in; an account in one of them is offered these first. */
    readonly currencies?: readonly string[];
}

/**
 * Names to offer while an account is being named: with nothing typed, every institution held in its currency;
 * once typed, any whose name starts with it, those first.
 */
export function suggestInstitutions(query: string, currency: string, limit: number): string[] {
    const key = merchantKey(query);
    const code = currency.toUpperCase();
    const local = (entry: InstitutionEntry) => entry.currencies?.includes(code) === true;
    if (key.length === 0) {
        return INSTITUTIONS.filter(local).map((entry) => entry.label);
    }
    const matches = INSTITUTIONS.filter(
        (entry) =>
            merchantKey(entry.label) !== key &&
            (merchantKey(entry.label).startsWith(key) || entry.patterns.some((pattern) => pattern.startsWith(key)))
    );
    return matches
        .toSorted((a, b) => Number(local(b)) - Number(local(a)))
        .slice(0, limit)
        .map((entry) => entry.label);
}

const INSTITUTIONS: readonly InstitutionEntry[] = [
    {
        domain: "chase.com",
        id: "chase",
        label: "Chase",
        patterns: ["chase", "chase bank", "jpmorgan chase", "jp morgan chase"],
    },
    {
        domain: "bankofamerica.com",
        id: "bank-of-america",
        label: "Bank of America",
        patterns: ["bank of america", "bofa"],
    },
    {
        domain: "wellsfargo.com",
        id: "wells-fargo",
        label: "Wells Fargo",
        patterns: ["wells fargo", "wellsfargo"],
    },
    { domain: "citi.com", id: "citi", label: "Citi", patterns: ["citi", "citibank"] },
    {
        domain: "capitalone.com",
        id: "capital-one",
        label: "Capital One",
        patterns: ["capital one", "capitalone"],
    },
    { domain: "usbank.com", id: "us-bank", label: "U.S. Bank", patterns: ["us bank", "u s bank", "usbank"] },
    { domain: "pnc.com", id: "pnc", label: "PNC", patterns: ["pnc", "pnc bank"] },
    { domain: "truist.com", id: "truist", label: "Truist", patterns: ["truist"] },
    { domain: "td.com", id: "td-bank", label: "TD Bank", patterns: ["td bank"] },
    {
        domain: "americanexpress.com",
        id: "american-express",
        label: "American Express",
        patterns: ["american express", "amex"],
    },
    { domain: "discover.com", id: "discover", label: "Discover", patterns: ["discover", "discover card"] },
    {
        domain: "schwab.com",
        id: "charles-schwab",
        label: "Charles Schwab",
        patterns: ["charles schwab", "schwab"],
    },
    { domain: "fidelity.com", id: "fidelity", label: "Fidelity", patterns: ["fidelity"] },
    { domain: "vanguard.com", id: "vanguard", label: "Vanguard", patterns: ["vanguard"] },
    { domain: "ally.com", id: "ally", label: "Ally", patterns: ["ally", "ally bank"] },
    { domain: "sofi.com", id: "sofi", label: "SoFi", patterns: ["sofi"] },
    { domain: "chime.com", id: "chime", label: "Chime", patterns: ["chime"] },
    {
        domain: "navyfederal.org",
        id: "navy-federal",
        label: "Navy Federal",
        patterns: ["navy federal", "navy federal credit union"],
    },
    { domain: "affirm.com", id: "affirm", installmentsIn: ["US", "CA"], label: "Affirm", patterns: ["affirm"] },
    {
        domain: "afterpay.com",
        id: "afterpay",
        installmentsIn: ["US", "CA", "AU", "NZ"],
        label: "Afterpay",
        patterns: ["afterpay", "after pay", "cash app afterpay"],
    },
    { domain: "sezzle.com", id: "sezzle", installmentsIn: ["US", "CA"], label: "Sezzle", patterns: ["sezzle"] },
    { domain: "splitit.com", id: "splitit", label: "Splitit", patterns: ["splitit", "split it"] },

    { domain: "paypal.com", id: "paypal", currencies: ["USD"], label: "PayPal", patterns: ["paypal"] },
    { domain: "venmo.com", id: "venmo", label: "Venmo", patterns: ["venmo"] },
    // "cash app", never bare "cash": plain cash is not a company.
    { domain: "cash.app", id: "cash-app", label: "Cash App", patterns: ["cash app", "cashapp"] },
    { domain: "zellepay.com", id: "zelle", currencies: ["USD"], label: "Zelle", patterns: ["zelle"] },
    { domain: "wise.com", id: "wise", label: "Wise", patterns: ["wise", "transferwise"] },
    { domain: "revolut.com", id: "revolut", label: "Revolut", patterns: ["revolut"] },
    { domain: "payoneer.com", id: "payoneer", label: "Payoneer", patterns: ["payoneer"] },
    { domain: "stripe.com", id: "stripe", label: "Stripe", patterns: ["stripe"] },
    { domain: "coinbase.com", id: "coinbase", label: "Coinbase", patterns: ["coinbase"] },
    { domain: "binance.com", id: "binance", currencies: ["USD"], label: "Binance", patterns: ["binance"] },
    { domain: "robinhood.com", id: "robinhood", label: "Robinhood", patterns: ["robinhood"] },
    { domain: "airtm.com", id: "airtm", currencies: ["USD"], label: "Airtm", patterns: ["airtm"] },
    { domain: "zinli.com", id: "zinli", currencies: ["USD"], label: "Zinli", patterns: ["zinli"] },

    { domain: "n26.com", id: "n26", label: "N26", patterns: ["n26"] },
    { domain: "monzo.com", id: "monzo", label: "Monzo", patterns: ["monzo"] },
    {
        domain: "starlingbank.com",
        id: "starling",
        label: "Starling Bank",
        patterns: ["starling", "starling bank"],
    },
    { domain: "hsbc.com", id: "hsbc", label: "HSBC", patterns: ["hsbc"] },
    { domain: "barclays.co.uk", id: "barclays", label: "Barclays", patterns: ["barclays"] },
    { domain: "lloydsbank.com", id: "lloyds", label: "Lloyds", patterns: ["lloyds", "lloyds bank"] },
    { domain: "natwest.com", id: "natwest", label: "NatWest", patterns: ["natwest"] },
    { domain: "db.com", id: "deutsche-bank", label: "Deutsche Bank", patterns: ["deutsche bank"] },
    { domain: "ing.com", id: "ing", label: "ING", patterns: ["ing", "ing bank", "ing direct"] },
    { domain: "bbva.com", id: "bbva", label: "BBVA", patterns: ["bbva"] },
    {
        domain: "santander.com",
        id: "santander",
        label: "Santander",
        patterns: ["santander", "banco santander"],
    },
    { domain: "caixabank.com", id: "caixabank", label: "CaixaBank", patterns: ["caixabank", "la caixa"] },
    {
        domain: "bancsabadell.com",
        id: "sabadell",
        label: "Banco Sabadell",
        patterns: ["sabadell", "banco sabadell"],
    },
    { domain: "bankinter.com", id: "bankinter", label: "Bankinter", patterns: ["bankinter"] },
    {
        domain: "klarna.com",
        id: "klarna",
        installmentsIn: ["US", "GB", "DE", "AT", "NL", "SE", "ES", "IT", "FR", "AU"],
        label: "Klarna",
        patterns: ["klarna"],
    },
    {
        domain: "clearpay.co.uk",
        id: "clearpay",
        installmentsIn: ["GB", "ES", "FR", "IT"],
        label: "Clearpay",
        patterns: ["clearpay", "clear pay"],
    },
    {
        domain: "scalapay.com",
        id: "scalapay",
        installmentsIn: ["IT", "FR", "ES"],
        label: "Scalapay",
        patterns: ["scalapay"],
    },
    // "alma pay", never bare "alma": it is a first name and a Spanish word.
    { domain: "almapay.com", id: "alma", installmentsIn: ["FR"], label: "Alma", patterns: ["alma pay", "almapay"] },
    { domain: "oney.com", id: "oney", installmentsIn: ["FR", "ES"], label: "Oney", patterns: ["oney"] },
    { domain: "zilch.com", id: "zilch", installmentsIn: ["GB"], label: "Zilch", patterns: ["zilch"] },
    {
        domain: "riverty.com",
        id: "riverty",
        installmentsIn: ["DE", "NL", "AT"],
        label: "Riverty",
        patterns: ["riverty"],
    },

    // "zip pay" and its old name, never bare "zip": it is a common word.
    {
        domain: "zip.co",
        id: "zip",
        installmentsIn: ["AU", "NZ", "US"],
        label: "Zip",
        patterns: ["zip pay", "zip co", "quadpay", "quad pay"],
    },
    // Atome has no global site; `atome.com` is another company.
    { domain: "atome.sg", id: "atome", installmentsIn: ["SG"], label: "Atome", patterns: ["atome"] },
    { domain: "tabby.ai", id: "tabby", installmentsIn: ["AE", "SA"], label: "Tabby", patterns: ["tabby"] },
    { domain: "tamara.co", id: "tamara", installmentsIn: ["SA", "AE"], label: "Tamara", patterns: ["tamara"] },
    { domain: "paidy.com", id: "paidy", installmentsIn: ["JP"], label: "Paidy", patterns: ["paidy"] },

    { domain: "nubank.com.br", id: "nubank", label: "Nubank", patterns: ["nubank", "nu bank"] },
    {
        domain: "mercadopago.com",
        id: "mercado-pago",
        label: "Mercado Pago",
        patterns: ["mercado pago", "mercadopago", "mercado credito"],
    },
    { domain: "itau.com.br", id: "itau", label: "Itaú", patterns: ["itau", "itau unibanco"] },
    { domain: "bradesco.com.br", id: "bradesco", label: "Bradesco", patterns: ["bradesco"] },
    { domain: "bb.com.br", id: "banco-do-brasil", label: "Banco do Brasil", patterns: ["banco do brasil"] },
    {
        domain: "caixa.gov.br",
        id: "caixa-economica",
        label: "Caixa Econômica",
        patterns: ["caixa economica", "caixa economica federal"],
    },
    { domain: "bancointer.com.br", id: "banco-inter", label: "Banco Inter", patterns: ["banco inter"] },
    { domain: "c6bank.com.br", id: "c6-bank", label: "C6 Bank", patterns: ["c6 bank", "c6bank"] },
    { domain: "picpay.com", id: "picpay", label: "PicPay", patterns: ["picpay"] },
    { domain: "banorte.com", id: "banorte", label: "Banorte", patterns: ["banorte"] },
    { domain: "banamex.com", id: "banamex", label: "Banamex", patterns: ["banamex", "citibanamex"] },
    { domain: "bancolombia.com", id: "bancolombia", label: "Bancolombia", patterns: ["bancolombia"] },
    { domain: "davivienda.com", id: "davivienda", label: "Davivienda", patterns: ["davivienda"] },
    { domain: "nequi.com.co", id: "nequi", label: "Nequi", patterns: ["nequi"] },
    { domain: "daviplata.com", id: "daviplata", label: "Daviplata", patterns: ["daviplata"] },
    {
        domain: "bancogalicia.com.ar",
        id: "banco-galicia",
        label: "Banco Galicia",
        patterns: ["banco galicia", "galicia"],
    },
    { domain: "uala.com.ar", id: "uala", label: "Ualá", patterns: ["uala"] },
    { domain: "bancochile.cl", id: "banco-de-chile", label: "Banco de Chile", patterns: ["banco de chile"] },
    { domain: "viabcp.com", id: "bcp", label: "BCP", patterns: ["bcp", "banco de credito del peru"] },
    { domain: "interbank.pe", id: "interbank", label: "Interbank", patterns: ["interbank"] },
    { domain: "scotiabank.com", id: "scotiabank", label: "Scotiabank", patterns: ["scotiabank"] },
    { domain: "rbc.com", id: "rbc", label: "RBC", patterns: ["rbc", "royal bank of canada"] },
    {
        domain: "kueskipay.com",
        id: "kueski-pay",
        installmentsIn: ["MX"],
        label: "Kueski Pay",
        patterns: ["kueski", "kueski pay", "kueskipay"],
    },
    { domain: "aplazo.mx", id: "aplazo", installmentsIn: ["MX"], label: "Aplazo", patterns: ["aplazo"] },
    {
        domain: "coppel.com",
        id: "coppel",
        installmentsIn: ["MX"],
        label: "Coppel",
        patterns: ["coppel", "credito coppel"],
    },
    { domain: "addi.com", id: "addi", installmentsIn: ["CO"], label: "Addi", patterns: ["addi"] },
    {
        domain: "sistecredito.com",
        id: "sistecredito",
        installmentsIn: ["CO"],
        label: "Sistecrédito",
        patterns: ["sistecredito", "siste credito"],
    },

    // Domains from each bank's own site as listed by Asobanca and SUDEBAN's bank codes (2026).
    {
        domain: "bancodevenezuela.com",
        id: "banco-de-venezuela",
        label: "Banco de Venezuela",
        patterns: ["banco de venezuela", "bdv"],
        currencies: ["VES"],
    },
    { domain: "banesco.com", id: "banesco", label: "Banesco", patterns: ["banesco"], currencies: ["VES"] },
    {
        domain: "mercantilbanco.com",
        id: "mercantil",
        label: "Mercantil",
        patterns: ["mercantil", "banco mercantil"],
        currencies: ["VES"],
    },
    {
        domain: "provincial.com",
        id: "provincial",
        label: "BBVA Provincial",
        patterns: ["bbva provincial", "provincial"],
        currencies: ["VES"],
    },
    {
        domain: "bncenlinea.com",
        id: "bnc",
        label: "BNC",
        patterns: ["bnc", "banco nacional de credito"],
        currencies: ["VES"],
    },
    { domain: "bancamiga.com", id: "bancamiga", label: "Bancamiga", patterns: ["bancamiga"], currencies: ["VES"] },
    { domain: "banplus.com", id: "banplus", label: "Banplus", patterns: ["banplus"], currencies: ["VES"] },
    {
        domain: "bancaribe.com.ve",
        id: "bancaribe",
        label: "Bancaribe",
        patterns: ["bancaribe", "banco del caribe"],
        currencies: ["VES"],
    },
    {
        domain: "bancoexterior.com",
        id: "exterior",
        label: "Banco Exterior",
        patterns: ["banco exterior"],
        currencies: ["VES"],
    },
    {
        domain: "bfc.com.ve",
        id: "bfc",
        label: "BFC Banco Fondo Común",
        patterns: ["bfc", "fondo comun", "banco fondo comun"],
        currencies: ["VES"],
    },
    { domain: "bancoactivo.com", id: "activo", label: "Banco Activo", patterns: ["banco activo"], currencies: ["VES"] },
    { domain: "bancoplaza.com", id: "plaza", label: "Banco Plaza", patterns: ["banco plaza"], currencies: ["VES"] },
    { domain: "sofitasa.com", id: "sofitasa", label: "Sofitasa", patterns: ["sofitasa"], currencies: ["VES"] },
    {
        domain: "venezolano.com",
        id: "venezolano-de-credito",
        label: "Venezolano de Crédito",
        patterns: ["venezolano de credito", "banco venezolano de credito"],
        currencies: ["VES"],
    },
    {
        domain: "100x100banco.com",
        id: "100-banco",
        label: "100% Banco",
        patterns: ["100 banco", "100x100 banco"],
        currencies: ["VES"],
    },
    {
        domain: "bancocaroni.com.ve",
        id: "caroni",
        label: "Banco Caroní",
        patterns: ["banco caroni"],
        currencies: ["VES"],
    },
    {
        domain: "delsur.com.ve",
        id: "del-sur",
        label: "Del Sur",
        patterns: ["delsur", "del sur banco", "banco del sur"],
        currencies: ["VES"],
    },
    {
        domain: "bt.com.ve",
        id: "tesoro",
        label: "Banco del Tesoro",
        patterns: ["banco del tesoro", "banco tesoro"],
        currencies: ["VES"],
    },
    // Bicentenario became the Banco Digital de los Trabajadores and kept its bank code.
    {
        domain: "bdt.com.ve",
        id: "bdt",
        label: "Banco Digital de los Trabajadores",
        patterns: ["bdt", "banco digital de los trabajadores", "bicentenario"],
        currencies: ["VES"],
    },
    { domain: "banfanb.com.ve", id: "banfanb", label: "BANFANB", patterns: ["banfanb"], currencies: ["VES"] },
    { domain: "bancrecer.com.ve", id: "bancrecer", label: "Bancrecer", patterns: ["bancrecer"], currencies: ["VES"] },
    { domain: "bangente.com.ve", id: "bangente", label: "Bangente", patterns: ["bangente"], currencies: ["VES"] },
    {
        domain: "n58bancodigital.com",
        id: "n58",
        label: "N58 Banco Digital",
        patterns: ["n58", "n58 banco digital"],
        currencies: ["VES"],
    },
    {
        domain: "r4conecta.io",
        id: "r4",
        label: "R4 Banco Microfinanciero",
        patterns: ["r4 banco", "r4 conecta"],
        currencies: ["VES"],
    },
    // Panamanian, but where many Venezuelans keep their dollars.
    {
        domain: "towerbank.com",
        id: "towerbank",
        label: "Towerbank",
        patterns: ["towerbank", "tower bank"],
        currencies: ["USD"],
    },
    {
        domain: "cashea.app",
        id: "cashea",
        installmentsIn: ["VE"],
        currencies: ["VES", "USD"],
        label: "Cashea",
        patterns: ["cashea"],
    },
    {
        domain: "krece.app",
        id: "krece",
        installmentsIn: ["VE"],
        currencies: ["VES", "USD"],
        label: "Krece",
        patterns: ["krece"],
    },
    {
        domain: "lysto.app",
        id: "lysto",
        installmentsIn: ["VE"],
        currencies: ["VES", "USD"],
        label: "Lysto",
        patterns: ["lysto"],
    },
    {
        domain: "chollo.app",
        id: "chollo",
        installmentsIn: ["VE"],
        currencies: ["VES", "USD"],
        label: "Chollo",
        patterns: ["chollo"],
    },
] as const;

export function institutionLabels(): readonly Pick<InstitutionEntry, "label" | "patterns">[] {
    return INSTITUTIONS;
}

export type InstallmentApp = Pick<InstitutionEntry, "domain" | "id" | "label"> & { readonly currency: string };

export function installmentRegion(regionCode: string | null | undefined): InstallmentRegion | null {
    const code = regionCode?.toUpperCase();
    return INSTALLMENT_REGIONS.find((region) => region === code) ?? null;
}

export function installmentAppsIn(region: InstallmentRegion | null): InstallmentApp[] {
    return region === null
        ? []
        : INSTITUTIONS.filter((entry) => entry.installmentsIn?.includes(region)).map(({ domain, id, label }) => ({
              currency: INSTALLMENT_CURRENCIES[region],
              domain,
              id,
              label,
          }));
}

export type FoundInstallmentApp = InstallmentApp & { readonly regions: readonly InstallmentRegion[] };

export function searchInstallmentApps(query: string, region: InstallmentRegion | null): FoundInstallmentApp[] {
    const key = merchantKey(query);
    if (key.length === 0) {
        return [];
    }
    const found = INSTITUTIONS.flatMap(({ domain, id, installmentsIn, label }) => {
        const [first] = installmentsIn ?? [];
        if (first === undefined || !merchantKey(label).includes(key)) {
            return [];
        }
        const home = region !== null && installmentsIn?.includes(region) ? region : first;
        const regions = [home, ...(installmentsIn ?? []).filter((other) => other !== home)];
        return [{ currency: INSTALLMENT_CURRENCIES[home], domain, id, label, regions }];
    });
    return found.sort((a, b) => Number(b.regions[0] === region) - Number(a.regions[0] === region));
}

const INSTITUTION_INDEX: ReadonlyMap<string, InstitutionEntry> = buildPatternIndex(INSTITUTIONS);

const INSTALLMENT_APP_LABELS: ReadonlyMap<string, string> = new Map(
    INSTITUTIONS.filter((entry) => entry.installmentsIn).map((entry) => [merchantKey(entry.label), entry.domain])
);

const INSTALLMENT_APP_DOMAINS: ReadonlySet<string> = new Set(INSTALLMENT_APP_LABELS.values());

// Label first: "Zip" and "Alma" brand nothing on their own, so the pattern lookup alone misses them.
export function installmentAppDomain(name: string): string | null {
    const key = merchantKey(name);
    const domain = INSTALLMENT_APP_LABELS.get(key) ?? resolveInstitutionDomain(key);
    return domain !== null && INSTALLMENT_APP_DOMAINS.has(domain) ? domain : null;
}

export function isInstallmentAppAccount(account: { readonly kind: string; readonly name: string }): boolean {
    return toAccountKind(account.kind) === "liability" && installmentAppDomain(account.name) !== null;
}

// No fuzzy tier: a near-miss would brand an account with another bank's logo, which is worse than none.
export function resolveInstitutionDomain(key: string): string | null {
    if (key.length === 0) {
        return null;
    }
    const exact = INSTITUTION_INDEX.get(key);
    if (exact != null) {
        return exact.domain;
    }
    const tokens = key.split(" ");
    for (const [pattern, entry] of INSTITUTION_INDEX) {
        if (containsTokenSequence(tokens, pattern.split(" "))) {
            return entry.domain;
        }
    }
    return null;
}
