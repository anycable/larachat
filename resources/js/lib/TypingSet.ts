export class TypingSet {
  private active: Record<string, number> = {};
  private interval: number = 1000;
  private _refresher: (names: string[]) => void;
  private _watchId: NodeJS.Timeout | null = null;

  constructor(refresh: (names: string[]) => void) {
    this._refresher = refresh;
  }

  get names(): string[] {
    return Object.keys(this.active);
  }

  add(name: string): void {
    this.active[name] = Date.now();
    this._watch();
    this._refresher(this.names);
  }

  remove(name: string): void {
    delete this.active[name];

    if (Object.keys(this.active).length === 0) {
      this.unwatch();
    }

    this._refresher(this.names);
  }

  unwatch(): void {
    if (this._watchId) {
      clearInterval(this._watchId);
      this._watchId = null;
    }
  }

  private _watch(): void {
    if (this._watchId) return;

    this._watchId = setInterval(() => {
      const now = Date.now();
      let needsRefresh = false;

      for (const name of Object.keys(this.active)) {
        const deadline = this.active[name] + this.interval;

        if (deadline < now) {
          delete this.active[name];
          needsRefresh = true;
        }
      }

      if (Object.keys(this.active).length === 0) {
        this.unwatch();
      }

      if (needsRefresh) {
        this._refresher(this.names);
      }
    }, this.interval);
  }
}