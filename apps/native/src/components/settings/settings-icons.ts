import Analytics01Icon from "@app/icons/analytics01-icon";
import ArchiveRestoreIcon from "@app/icons/archive-restore-icon";
import BadgeCentIcon from "@app/icons/badge-cent-icon";
import BankIcon from "@app/icons/bank-icon";
import BiometricAccessIcon from "@app/icons/biometric-access-icon";
import Calculator01Icon from "@app/icons/calculator01-icon";
import CalendarClockIcon from "@app/icons/calendar-clock-icon";
import Calendar01Icon from "@app/icons/calendar01-icon";
import Camera01Icon from "@app/icons/camera01-icon";
import ChartBarLineIcon from "@app/icons/chart-bar-line-icon";
import ChartLineData01Icon from "@app/icons/chart-line-data01-icon";
import Clock04Icon from "@app/icons/clock04-icon";
import CloudIcon from "@app/icons/cloud-icon";
import CreditCardIcon from "@app/icons/credit-card-icon";
import CurrencyIcon from "@app/icons/currency-icon";
import DarkModeIcon from "@app/icons/dark-mode-icon";
import DashboardSpeed01Icon from "@app/icons/dashboard-speed01-icon";
import DashboardSquare01Icon from "@app/icons/dashboard-square01-icon";
import Delete02Icon from "@app/icons/delete02-icon";
import FavouriteIcon from "@app/icons/favourite-icon";
import FileExportIcon from "@app/icons/file-export-icon";
import FileImportIcon from "@app/icons/file-import-icon";
import InformationCircleIcon from "@app/icons/information-circle-icon";
import LanguageSkillIcon from "@app/icons/language-skill-icon";
import LayoutTable01Icon from "@app/icons/layout-table01-icon";
import LegalDocument01Icon from "@app/icons/legal-document01-icon";
import LicenseIcon from "@app/icons/license-icon";
import Logout01Icon from "@app/icons/logout01-icon";
import Mail01Icon from "@app/icons/mail01-icon";
import Mic01Icon from "@app/icons/mic01-icon";
import MoneyAdd01Icon from "@app/icons/money-add01-icon";
import NewTwitterIcon from "@app/icons/new-twitter-icon";
import Notification03Icon from "@app/icons/notification03-icon";
import SecurityCheckIcon from "@app/icons/security-check-icon";
import Share08Icon from "@app/icons/share08-icon";
import SmartPhone01Icon from "@app/icons/smart-phone01-icon";
import SourceCodeIcon from "@app/icons/source-code-icon";
import SparklesIcon from "@app/icons/sparkles-icon";
import StarIcon from "@app/icons/star-icon";
import SunriseIcon from "@app/icons/sunrise-icon";
import SwatchIcon from "@app/icons/swatch-icon";
import Tap01Icon from "@app/icons/tap01-icon";
import TestTubeIcon from "@app/icons/test-tube-icon";
import TextFontIcon from "@app/icons/text-font-icon";
import UserCircleIcon from "@app/icons/user-circle-icon";
import UserRemove01Icon from "@app/icons/user-remove01-icon";
import Wallet01Icon from "@app/icons/wallet01-icon";
import type { IconSvgElement } from "@hugeicons/react-native";

const REGISTRY = {
    Analytics01: Analytics01Icon,
    ArchiveRestore: ArchiveRestoreIcon,
    BadgeCent: BadgeCentIcon,
    Bank: BankIcon,
    BiometricAccess: BiometricAccessIcon,
    Calculator01: Calculator01Icon,
    Calendar01: Calendar01Icon,
    CalendarClock: CalendarClockIcon,
    Camera01: Camera01Icon,
    ChartBarLine: ChartBarLineIcon,
    ChartLineData01: ChartLineData01Icon,
    Clock04: Clock04Icon,
    Cloud: CloudIcon,
    CreditCard: CreditCardIcon,
    Currency: CurrencyIcon,
    DarkMode: DarkModeIcon,
    DashboardSpeed01: DashboardSpeed01Icon,
    DashboardSquare01: DashboardSquare01Icon,
    Delete02: Delete02Icon,
    Favourite: FavouriteIcon,
    FileExport: FileExportIcon,
    FileImport: FileImportIcon,
    InformationCircle: InformationCircleIcon,
    LanguageSkill: LanguageSkillIcon,
    LayoutTable01: LayoutTable01Icon,
    LegalDocument01: LegalDocument01Icon,
    License: LicenseIcon,
    Logout01: Logout01Icon,
    Mail01: Mail01Icon,
    Mic01: Mic01Icon,
    MoneyAdd01: MoneyAdd01Icon,
    NewTwitter: NewTwitterIcon,
    Notification03: Notification03Icon,
    SecurityCheck: SecurityCheckIcon,
    Share08: Share08Icon,
    SmartPhone01: SmartPhone01Icon,
    SourceCode: SourceCodeIcon,
    Sparkles: SparklesIcon,
    Star: StarIcon,
    Sunrise: SunriseIcon,
    Swatch: SwatchIcon,
    Tap01: Tap01Icon,
    TestTube: TestTubeIcon,
    TextFont: TextFontIcon,
    UserCircle: UserCircleIcon,
    UserRemove01: UserRemove01Icon,
    Wallet01: Wallet01Icon,
} satisfies Record<string, IconSvgElement>;

export type SettingsIconName = keyof typeof REGISTRY;

export function settingsIcon(name: SettingsIconName): IconSvgElement {
    return REGISTRY[name];
}
