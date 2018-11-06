export interface INotificationListener {
    preferenceChanged(name: string, value: any): void;
}

export type PreferenceType = string | number | boolean | object;

export abstract class PreferencesManager {
    public readonly HaveStorage: boolean;

    private _notificationListeners: INotificationListener[] = [];

    readonly _prefix: string = "pref";

    protected constructor(prefix: string) {
        this._prefix = prefix;
        this.HaveStorage = typeof(Storage) !== undefined;
        this.validateDefaultPreferences();
    }

    public get Prefix(): string {
        return this._prefix;
    }

    protected validateDefaultPreferences() {
    }

    public addListener(listener: INotificationListener): void {
        if (this._notificationListeners.indexOf(listener) === -1) {
            this._notificationListeners.push(listener);
        }
    }

    public removeListener(listener: INotificationListener): void {
        this._notificationListeners = this._notificationListeners.filter(n => n !== listener);
    }

    private notifyListeners(name: string, value: any): void {
        this._notificationListeners.map(n => {
            n.preferenceChanged(name, value);
        });
    }

    ///
    /// Local
    ///

    protected saveLocalValue(key: string, value: PreferenceType): void {
        if (this.HaveStorage) {
            this.writeValue(localStorage, key, value);
        }
    }

    protected loadLocalValue<T extends PreferenceType>(key: string, defaultValue: T): T {
        return this.HaveStorage ? this.readValue<T>(localStorage, key, defaultValue) : defaultValue;
    }

    protected setDefaultLocalValue(key: string, value: PreferenceType): void {
        if (this.HaveStorage) {
            this.writeDefaultValue(localStorage, key, value);
        }
    }

    ///
    /// Session
    ///

    protected saveSessionValue(key: string, value: PreferenceType): void {
        if (this.HaveStorage) {
            this.writeValue(sessionStorage, key, value);
        }
    }

    protected loadSessionValue<T extends PreferenceType>(key: string, defaultValue: T): T {
        return this.HaveStorage ? this.readValue<T>(sessionStorage, key, defaultValue) : defaultValue;
    }

    protected setDefaultSessionValue(key: string, value: PreferenceType): void {
        if (this.HaveStorage) {
            this.writeDefaultValue(sessionStorage, key, value);
        }
    }

    //
    // Internal
    //

    private writeValue(storage: Storage, key: string, value: PreferenceType): void {
        if (typeof value === "string") {
            storage.setItem(this._prefix + key, value);
        } else if (typeof value === "boolean") {
            storage.setItem(this._prefix + key, value.toString());
        } else if (typeof value === "number") {
            storage.setItem(this._prefix + key, value.toFixed(10));
        } else {
            storage.setItem(this._prefix + key, JSON.stringify(value));
        }

        this.notifyListeners(key, value);
    }


    private readValue<T extends PreferenceType>(storage: Storage, key: string, defaultValue: T): T {
        if (typeof defaultValue === "string") {
            return storage.getItem(this._prefix + key) as T;
        } else if (typeof defaultValue === "boolean") {
            return (storage.getItem(this._prefix + key) === true.toString()) as T;
        } else if (typeof defaultValue === "number") {
            return parseFloat(storage.getItem(this._prefix + key)) as T;
        } else {
            return JSON.parse(storage.getItem(this._prefix + key)) as T;
        }
    }

    private writeDefaultValue(storage: Storage, key: string, value: PreferenceType): void {
        if (!storage.getItem(this._prefix + key)) {
            this.writeValue(storage, key, value);
        }
    }
}
