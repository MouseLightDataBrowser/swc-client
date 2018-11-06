import {PreferencesManager} from "./preferencesManager";

const SwcPageOffset = "swc.page.offset";
const SwcPageLimit = "swc.page.limit";
const LockedSampleId = "swc.create.locked.sample";

export class UserPreferences extends PreferencesManager {
    private static _instance: UserPreferences = null;

    public static get Instance(): UserPreferences {
        if (!this._instance) {
            this._instance = new UserPreferences("mnb:");
        }

        return this._instance;
    }

    public get swcPageOffset(): number {
        return this.loadLocalValue(SwcPageOffset, 0);
    }

    public set swcPageOffset(offset: number) {
        this.saveLocalValue(SwcPageOffset, offset);
    }

    public get swcPageLimit(): number {
        return this.loadLocalValue(SwcPageLimit, 10);
    }

    public set swcPageLimit(offset: number) {
        this.saveLocalValue(SwcPageLimit, offset);
    }

    public get lockedSampleId(): string {
        return this.loadLocalValue(LockedSampleId, "");
    }

    public set lockedSampleId(id: string) {
        this.saveLocalValue(LockedSampleId, id);
    }

    protected validateDefaultPreferences() {
        this.setDefaultLocalValue(SwcPageOffset, 0);
        this.setDefaultLocalValue(SwcPageLimit, 10);
        this.setDefaultLocalValue(LockedSampleId, "");
    }
}

