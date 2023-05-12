export class WaitHandle {
  private resolveCollection: (() => void)[] = [];

  release() {
    for (const resolve of this.resolveCollection) {
      resolve();
    }
    this.resolveCollection = [];
  }

  wait(): Promise<void> {
    return new Promise((resolve) => {
      this.resolveCollection.push(resolve);
    });
  }
}
