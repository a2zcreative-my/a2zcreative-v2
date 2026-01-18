"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { Camera, CameraOff, X } from "lucide-react";

interface QrScannerProps {
    onScan: (result: string) => void;
    onError?: (error: string) => void;
    onClose: () => void;
}

export default function QrScanner({ onScan, onError, onClose }: QrScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>("");
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Get available cameras
        Html5Qrcode.getCameras()
            .then((devices) => {
                if (devices && devices.length > 0) {
                    setCameras(devices);
                    // Prefer back camera if available
                    const backCamera = devices.find(d =>
                        d.label.toLowerCase().includes("back") ||
                        d.label.toLowerCase().includes("rear")
                    );
                    setSelectedCamera(backCamera?.id || devices[0].id);
                } else {
                    setError("No cameras found on this device");
                }
            })
            .catch((err) => {
                setError("Unable to access camera. Please ensure camera permissions are granted.");
                console.error("Camera access error:", err);
            });

        return () => {
            // Cleanup scanner on unmount
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const startScanning = async () => {
        if (!selectedCamera || !containerRef.current) return;

        setError(null);
        setIsScanning(true);

        try {
            scannerRef.current = new Html5Qrcode("qr-reader");

            await scannerRef.current.start(
                selectedCamera,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1,
                },
                (decodedText) => {
                    // Successfully scanned
                    onScan(decodedText);
                    stopScanning();
                },
                (errorMessage) => {
                    // QR not detected - this is normal, don't show error
                    // console.log("Scanning...", errorMessage);
                }
            );
        } catch (err) {
            setIsScanning(false);
            const errorMsg = err instanceof Error ? err.message : "Failed to start camera";
            setError(errorMsg);
            onError?.(errorMsg);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
        setIsScanning(false);
    };

    return (
        <div className="glass-card p-6 text-center relative">
            {/* Close button */}
            <button
                onClick={() => {
                    stopScanning();
                    onClose();
                }}
                className="absolute top-4 right-4 p-2 rounded-lg bg-background-tertiary hover:bg-error/20 transition-colors"
            >
                <X className="w-5 h-5 text-foreground-muted hover:text-error" />
            </button>

            <h3 className="text-lg font-semibold text-white mb-4">QR Code Scanner</h3>

            {/* Camera selector */}
            {cameras.length > 1 && (
                <div className="mb-4">
                    <select
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.target.value)}
                        className="input-field text-sm"
                        disabled={isScanning}
                    >
                        {cameras.map((camera) => (
                            <option key={camera.id} value={camera.id}>
                                {camera.label || `Camera ${camera.id}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Scanner container */}
            <div
                ref={containerRef}
                className="relative mx-auto mb-4 overflow-hidden rounded-2xl bg-background-tertiary"
                style={{ maxWidth: "300px" }}
            >
                <div id="qr-reader" style={{ width: "100%" }} />

                {!isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                        <Camera className="w-16 h-16 text-primary mb-4" />
                        <p className="text-foreground-muted text-sm">
                            {cameras.length > 0
                                ? "Click Start to begin scanning"
                                : "Checking for cameras..."}
                        </p>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-error/20 text-error text-sm">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-2 justify-center">
                {!isScanning ? (
                    <button
                        onClick={startScanning}
                        className="btn-primary flex items-center gap-2"
                        disabled={!selectedCamera}
                    >
                        <Camera className="w-4 h-4" />
                        Start Scanning
                    </button>
                ) : (
                    <button
                        onClick={stopScanning}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <CameraOff className="w-4 h-4" />
                        Stop Scanning
                    </button>
                )}
            </div>

            <p className="text-foreground-muted text-xs mt-4">
                Point the camera at a guest&apos;s QR code to check them in
            </p>
        </div>
    );
}
