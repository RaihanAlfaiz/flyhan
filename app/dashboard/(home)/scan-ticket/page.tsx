"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { verifyTicketCheckIn } from "./lib/actions";
import Swal from "sweetalert2";
import {
  Loader2,
  ScanLine,
  CheckCircle,
  XCircle,
  Camera,
  StopCircle,
  Image as ImageIcon,
} from "lucide-react";

export default function ScanTicketPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastScannedData, setLastScannedData] = useState<any>(null);

  // Custom Camera States
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false); // Ref for immediate sync status

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          setSelectedCameraId(devices[0].id);
        }
      })
      .catch((err) => {
        console.error("Error getting cameras", err);
      });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCameraId) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      await scannerRef.current.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // ignore parsing error
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Failed to start scanning", err);
      Swal.fire("Error", "Gagal memulai kamera.", "error");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
        try {
          scannerRef.current.clear();
        } catch (e) {}
      } catch (err) {
        console.error("Failed to stop scanning", err);
      }
    }
  };

  const processTicket = async (code: string) => {
    if (loading || isProcessingRef.current) return;

    isProcessingRef.current = true; // Lock
    setLoading(true);

    // Pause camera if running
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.pause();
      } catch (e) {}
    }

    setScanResult(code);

    try {
      const result = await verifyTicketCheckIn(code);
      setLastScannedData(result);

      if (result.success) {
        // Play success sound
        const audio = new Audio("/assets/sounds/success.mp3");
        audio.play().catch(() => {});

        await Swal.fire({
          icon: "success",
          title: "Check-in Berhasil!",
          text: `${result.data?.passengerName} - Seat ${result.data?.seatNumber}`,
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      } else {
        // Play error sound
        const audio = new Audio("/assets/sounds/error.mp3");
        audio.play().catch(() => {});

        await Swal.fire({
          icon: "error",
          title: "Gagal / Invalid",
          text: result.message,
          confirmButtonColor: "#d33",
          allowOutsideClick: false,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memproses tiket", "error");
    } finally {
      setLoading(false);
      isProcessingRef.current = false; // Unlock

      // Resume camera
      if (scannerRef.current && isScanning) {
        try {
          await scannerRef.current.resume();
        } catch (e) {}
      }
    }
  };

  const onScanSuccess = (decodedText: string) => {
    if (isProcessingRef.current) return;
    processTicket(decodedText);
  };

  // Image Scan Logic
  const handleFileScanButton = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      try {
        setLoading(true);
        const result = await scannerRef.current.scanFile(file, true);
        processTicket(result);
      } catch (err) {
        console.error("Error scanning file", err);
        Swal.fire("Error", "Gagal membaca QR code dari gambar", "error");
        setLoading(false);
      } finally {
        // Reset input so same file can be selected again
        e.target.value = "";
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) processTicket(manualCode);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-flysha-black">
          Gate Check-in Scanner
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Scanner */}
        <div className="flex flex-col gap-6 bg-white p-6 rounded-xl shadow-sm border">
          {/* Camera Controls */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">
              Metode Scan
            </label>
            <div className="flex gap-2 flex-wrap">
              <select
                className="flex-1 min-w-[150px] border rounded-lg px-3 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-flysha-light-purple"
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                disabled={isScanning}
              >
                {cameras.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Camera ${cam.id}`}
                  </option>
                ))}
                {cameras.length === 0 && <option>Mendeteksi kamera...</option>}
              </select>

              {!isScanning ? (
                <button
                  onClick={startScanning}
                  disabled={cameras.length === 0}
                  className="flex items-center gap-2 bg-flysha-light-purple text-flysha-black px-4 py-2 rounded-lg font-bold hover:bg-flysha-light-purple/90 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" /> Live Scan
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors"
                >
                  <StopCircle className="w-5 h-5" /> Stop
                </button>
              )}

              {/* Image Upload Button */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={handleFileScanButton}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors border"
              >
                <ImageIcon className="w-5 h-5" /> Upload File
              </button>
            </div>
          </div>

          {/* Scanner Area */}
          <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden flex items-center justify-center">
            <div id="reader" className="w-full h-full"></div>
            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-black/80 z-10 pointer-events-none">
                <ScanLine className="w-12 h-12 mb-2" />
                <p className="text-sm">Kamera tidak aktif</p>
                <p className="text-xs mt-1">
                  Gunakan tombol di atas untuk mulai
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-gray-400 text-sm">ATAU INPUT MANUAL</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Masukkan Kode Tiket (TRX-...)"
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-flysha-light-purple outline-none"
            />
            <button
              type="submit"
              disabled={loading || !manualCode}
              className="bg-flysha-dark-purple text-white px-6 py-2 rounded-lg font-bold hover:bg-flysha-black transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Check"}
            </button>
          </form>
        </div>

        {/* Right Column: Result */}
        <div className="flex flex-col gap-6">
          {lastScannedData ? (
            <div
              className={`p-8 rounded-xl border-2 flex flex-col items-center text-center gap-4 ${
                lastScannedData.success
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              {lastScannedData.success ? (
                <CheckCircle className="w-20 h-20 text-green-500" />
              ) : (
                <XCircle className="w-20 h-20 text-red-500" />
              )}

              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {lastScannedData.success
                    ? "BOARDING PASS VALID"
                    : "INVALID / USED"}
                </h2>
                <p className="text-gray-600">{lastScannedData.message}</p>
              </div>

              {lastScannedData.data && (
                <div className="w-full bg-white p-4 rounded-lg border mt-4 text-left flex flex-col gap-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Kode Tiket</span>
                    <span className="font-bold">
                      {lastScannedData.data.ticketCode}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Penumpang</span>
                    <span className="font-bold">
                      {lastScannedData.data.passengerName}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Penerbangan</span>
                    <span className="font-bold">
                      {lastScannedData.data.flightCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kursi</span>
                    <span className="font-bold text-xl text-flysha-dark-purple">
                      {lastScannedData.data.seatNumber}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center h-full min-h-[300px] text-gray-400">
              <ScanLine className="w-16 h-16 mb-4 opacity-50" />
              <p>Hasil scan akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
