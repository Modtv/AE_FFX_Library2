// After Effects ExtendScript - FFX Preset Uygulayıcı
// Bu dosya After Effects ile doğrudan iletişim kurar

// Test fonksiyonu - dosya yolunu kontrol et
function testFFXPath() {
    try {
        var panelPath = getPanelPath();
        var ffxFilePath = panelPath + "/effects/ffx/4kfullhd.ffx";
        
        // Windows dosya yolu düzeltme
        ffxFilePath = ffxFilePath.replace(/\\/g, "/");
        
        var ffxFile = new File(ffxFilePath);
        
        if (ffxFile.exists) {
            return "found: " + ffxFilePath;
        } else {
            return "Panel yolu: " + panelPath + " | FFX aranıyor: " + ffxFilePath + " | Dosya mevcut değil";
        }
    } catch (error) {
        return "Test hatası: " + error.toString();
    }
}

// YENİ FONKSİYON: Adjustment Layer oluşturup efekt uygula
function applyPresetToAdjustmentLayer(presetName, adjustmentLayerName) {
    try {
        // Aktif kompozisyonu kontrol et
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            return "no_comp";
        }
        
        // Panel yolunu al
        var panelPath = getPanelPath();
        var ffxFilePath = panelPath + "/effects/ffx/" + presetName + ".ffx";
        
        // Windows slash'larını düzelt
        ffxFilePath = ffxFilePath.replace(/\\/g, "/");
        
        // FFX dosyasının varlığını kontrol et
        var ffxFile = new File(ffxFilePath);
        
        if (!ffxFile.exists) {
            return "file_not_found: " + ffxFilePath;
        }
        
        // Undo grubunu başlat
        app.beginUndoGroup("Adjustment Layer + Preset: " + presetName);
        
        // Yeni Adjustment Layer oluştur
        var adjustmentLayer = comp.layers.addSolid([1, 1, 1], adjustmentLayerName || ("Adj_" + presetName), comp.width, comp.height, comp.pixelAspect, comp.duration);
        adjustmentLayer.adjustmentLayer = true;
        
        // Adjustment Layer'ı en üste taşı
        adjustmentLayer.moveToBeginning();
        
        // FFX efektini Adjustment Layer'a uygula
        applyFFXToLayer(adjustmentLayer, ffxFile);
        
        // Adjustment Layer'ı seç
        // Önce tüm seçimleri temizle
        for (var i = 1; i <= comp.numLayers; i++) {
            comp.layer(i).selected = false;
        }
        // Yeni oluşturulan layer'ı seç
        adjustmentLayer.selected = true;
        
        // Undo grubunu bitir
        app.endUndoGroup();
        
        logMessage("Adjustment Layer oluşturuldu ve preset uygulandı: " + presetName);
        return "success_adjustment";
        
    } catch (error) {
        app.endUndoGroup();
        logMessage("Adjustment Layer hatası: " + error.toString());
        return "Hata: " + error.toString();
    }
}

// Geliştirilmiş preset uygulama - hem normal hem adjustment layer seçeneği
function applyPresetSmart(presetName, useAdjustmentLayer, customLayerName) {
    try {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            return "no_comp";
        }
        
        // Panel yolunu al
        var panelPath = getPanelPath();
        var ffxFilePath = panelPath + "/effects/ffx/" + presetName + ".ffx";
        
        // Windows slash'larını düzelt
        ffxFilePath = ffxFilePath.replace(/\\/g, "/");
        
        var ffxFile = new File(ffxFilePath);
        
        if (!ffxFile.exists) {
            return "file_not_found";
        }
        
        app.beginUndoGroup("Smart Preset Apply: " + presetName);
        
        var targetLayer;
        
        if (useAdjustmentLayer === true || useAdjustmentLayer === "true") {
            // Adjustment Layer oluştur
            var layerName = customLayerName || ("Adj_" + presetName);
            targetLayer = comp.layers.addSolid([1, 1, 1], layerName, comp.width, comp.height, comp.pixelAspect, comp.duration);
            targetLayer.adjustmentLayer = true;
            targetLayer.moveToBeginning();
            
            // Adjustment Layer'ı seç
            for (var i = 1; i <= comp.numLayers; i++) {
                comp.layer(i).selected = false;
            }
            targetLayer.selected = true;
            
        } else {
            // Seçili katmanları kontrol et
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                return "no_layer";
            }
            targetLayer = selectedLayers[0];
        }
        
        // FFX efektini uygula
        applyFFXToLayer(targetLayer, ffxFile);
        
        app.endUndoGroup();
        
        var resultType = useAdjustmentLayer ? "success_adjustment" : "success_layer";
        logMessage("Preset başarıyla uygulandı: " + presetName + " (" + resultType + ")");
        return resultType;
        
    } catch (error) {
        app.endUndoGroup();
        logMessage("Smart preset hata: " + error.toString());
        return "Hata: " + error.toString();
    }
}

// ESKİ FONKSİYONLAR (Uyumluluk için korundu)
function applyFFXPreset() {
    try {
        // Aktif kompozisyonu kontrol et
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            return "no_comp";
        }
        
        // Seçili katmanları kontrol et
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            return "no_layer";
        }
        
        // İlk seçili katmanı al
        var targetLayer = selectedLayers[0];
        
        // Panel dosya yolunu al ve manuel FFX dosya yolu belirt
        var panelPath = getPanelPath();
        var ffxFilePath = panelPath + "/effects/ffx/4kfullhd.ffx";
        
        // Windows slash'larını düzelt
        ffxFilePath = ffxFilePath.replace(/\\/g, "/");
        
        // FFX dosyasının varlığını kontrol et
        var ffxFile = new File(ffxFilePath);
        
        if (!ffxFile.exists) {
            return "no_file: " + ffxFilePath;
        }
        
        // Undo grubunu başlat
        app.beginUndoGroup("FFX Preset Uygula");
        
        // FFX dosyasını katmana uygula
        applyFFXToLayer(targetLayer, ffxFile);
        
        // Undo grubunu bitir
        app.endUndoGroup();
        
        return "success";
        
    } catch (error) {
        app.endUndoGroup();
        return "Hata: " + error.toString();
    }
}

function getPanelPath() {
    // Manuel panel yolu - senin sistemindeki gerçek konum
    return "C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/AE_FFX_Library";
}

function findFFXFiles(folderPath) {
    var ffxFiles = [];
    var folder = new Folder(folderPath);
    
    if (!folder.exists) {
        return ffxFiles;
    }
    
    var files = folder.getFiles("*.ffx");
    for (var i = 0; i < files.length; i++) {
        if (files[i] instanceof File) {
            ffxFiles.push(files[i]);
        }
    }
    
    return ffxFiles;
}

function applyFFXToLayer(layer, ffxFile) {
    try {
        // FFX dosyasını oku ve uygula
        var ffxData = readFFXFile(ffxFile);
        
        if (ffxData) {
            // FFX verilerini katmana uygula
            applyEffectFromFFX(layer, ffxData, ffxFile);
        }
        
    } catch (error) {
        throw new Error("FFX uygulanırken hata: " + error.toString());
    }
}

function readFFXFile(ffxFile) {
    try {
        ffxFile.open("r");
        var content = ffxFile.read();
        ffxFile.close();
        return content;
    } catch (error) {
        return null;
    }
}

function applyEffectFromFFX(layer, ffxData, ffxFile) {
    try {
        // Basit yöntem: FFX dosyasını doğrudan layer'a import et
        // After Effects'in built-in FFX parser'ını kullan
        
        // Geçici bir dosya oluştur
        var tempFolder = new Folder(Folder.temp.fsName + "/PresetApplicator");
        if (!tempFolder.exists) {
            tempFolder.create();
        }
        
        var tempFile = new File(tempFolder.fsName + "/" + ffxFile.name);
        
        // FFX dosyasını geçici konuma kopyala
        ffxFile.copy(tempFile);
        
        // Layer'a efekti uygula
        if (tempFile.exists) {
            // After Effects'in applyPreset metodunu kullan
            layer.applyPreset(tempFile);
            
            // Geçici dosyayı temizle
            tempFile.remove();
        }
        
    } catch (error) {
        throw new Error("Efekt uygulanırken hata: " + error.toString());
    }
}

// Yardımcı fonksiyonlar

function getSelectedLayers() {
    var comp = app.project.activeItem;
    if (comp instanceof CompItem) {
        return comp.selectedLayers;
    }
    return [];
}

function logMessage(message) {
    // Debug için - ileride kaldırılabilir
    $.writeln("Preset Applicator: " + message);
}

// Panel başlatma fonksiyonu
function initializePanel() {
    logMessage("Panel başlatıldı");
    return "Panel hazır";
}

// Panel kapatma fonksiyonu
function cleanupPanel() {
    logMessage("Panel kapatılıyor");
    // Gerekirse temizlik işlemleri
}

// Gelecek özellikler için placeholder fonksiyonlar
function listAvailablePresets() {
    var panelPath = getPanelPath();
    var ffxFolderPath = panelPath + "/effects/ffx/";
    var ffxFiles = findFFXFiles(ffxFolderPath);
    
    var presetList = [];
    for (var i = 0; i < ffxFiles.length; i++) {
        presetList.push({
            name: ffxFiles[i].displayName,
            path: ffxFiles[i].fsName
        });
    }
    
    return JSON.stringify(presetList);
}

function applyPresetAuto(presetName) {
    // Otomatik preset uygulama - GIF adından .ffx dosyasını bul
    try {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            return "no_comp";
        }
        
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            return "no_layer";
        }
        
        // Manuel panel yolu
        var panelPath = getPanelPath();
        var ffxFilePath = panelPath + "./effects/ffx/" + presetName + ".ffx";
        
        var ffxFile = new File(ffxFilePath);
        
        if (!ffxFile.exists) {
            return "file_not_found";
        }
        
        app.beginUndoGroup("Auto Preset Apply: " + presetName);
        applyFFXToLayer(selectedLayers[0], ffxFile);
        app.endUndoGroup();
        
        logMessage("Preset başarıyla uygulandı: " + presetName + ".ffx");
        return "success";
        
    } catch (error) {
        app.endUndoGroup();
        logMessage("Preset uygulama hatası: " + error.toString());
        return "Hata: " + error.toString();
    }
}