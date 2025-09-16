// Mock BLE service for Expo Go compatibility
interface MockDevice {
    id: string;
    name: string;
    rssi: number;
}

class BLEService {
    private isScanning: boolean = false;
    private scanTimeout: NodeJS.Timeout | null = null;

    async requestPermissions(): Promise<boolean> {
        // Mock permission - always return true for demo
        return true;
    }

    async startScan(onDeviceFound: (device: MockDevice) => void): Promise<void> {
        if (this.isScanning) {
            return;
        }

        this.isScanning = true;

        // Mock scanning - simulate finding devices after a delay
        setTimeout(() => {
            const mockDevices: MockDevice[] = [
                { id: 'cQPEG7vMWvMnSHKc5QGMvMEUi7W2', name: "Usman Test", rssi: -45 },
                { id: 'hqjjbNUbksbFNPUifJT84lA0HD02', name: "Usman Ayobami", rssi: -60 },
                { id: 'mock-3', name: "Carol's Device", rssi: -75 },
            ];

            mockDevices.forEach((device, index) => {
                setTimeout(() => {
                    if (this.isScanning) {
                        onDeviceFound(device);
                    }
                }, index * 1000); // Stagger device discovery
            });
        }, 1000);

        // Stop scanning after 10 seconds
        this.scanTimeout = setTimeout(() => {
            this.stopScan();
        }, 10000);
    }

    async stopScan(): Promise<void> {
        if (this.isScanning) {
            this.isScanning = false;
            if (this.scanTimeout) {
                clearTimeout(this.scanTimeout);
                this.scanTimeout = null;
            }
        }
    }

    isCurrentlyScanning(): boolean {
        return this.isScanning;
    }

    destroy(): void {
        this.stopScan();
    }
}

export default new BLEService();
