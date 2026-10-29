const express = require('express');
const router = express.Router();
const db = require('../db');

// Check compatibility of selected parts
router.post('/check-compatibility', async (req, res) => {
  try {
    const { parts } = req.body; // { cpu, mainboard, ram, vga, psu, ssd, case, cooling }
    const warnings = [];
    const notes = [];
    let estimatedWattage = 80; // Base motherboard, fans, chipset power

    // Check CPU & Mainboard Socket
    if (parts.cpu && parts.mainboard) {
      const cpuSocket = parts.cpu.specs?.socket;
      const mbSocket = parts.mainboard.specs?.socket;
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        warnings.push(`Không tương thích Socket: CPU sử dụng socket [${cpuSocket}] nhưng Mainboard là socket [${mbSocket}].`);
      } else if (cpuSocket && mbSocket) {
        notes.push(`Tương thích Socket: Cả CPU và Mainboard đều hỗ trợ socket chuẩn [${cpuSocket}].`);
      }
    }

    // Check RAM & Mainboard Type
    if (parts.ram && parts.mainboard) {
      const ramType = parts.ram.specs?.type;
      const mbRamType = parts.mainboard.specs?.ramType;
      if (ramType && mbRamType && ramType !== mbRamType) {
        warnings.push(`Không tương thích chuẩn RAM: RAM là [${ramType}] nhưng Mainboard yêu cầu [${mbRamType}].`);
      } else if (ramType && mbRamType) {
        notes.push(`Tương thích bộ nhớ: Cả RAM và Mainboard đều là chuẩn [${ramType}].`);
      }
    }

    // Calculate Power & PSU check
    if (parts.cpu?.specs?.tdp) {
      estimatedWattage += Number(parts.cpu.specs.tdp);
    }
    if (parts.vga?.specs?.tdp) {
      estimatedWattage += Number(parts.vga.specs.tdp);
    }

    const recommendedWattage = Math.round(estimatedWattage * 1.35 / 50) * 50; // Safety headroom

    if (parts.psu) {
      const psuWattage = Number(parts.psu.specs?.wattage || 0);
      if (psuWattage > 0 && psuWattage < estimatedWattage) {
        warnings.push(`Cảnh báo công suất nguồn: Nguồn [${psuWattage}W] có thể không đủ tải (Hệ thống cần tối thiểu ~${estimatedWattage}W).`);
      } else if (psuWattage > 0 && psuWattage < recommendedWattage) {
        notes.push(`Nguồn [${psuWattage}W] đủ dùng, khuyến nghị [${recommendedWattage}W+] để đảm bảo an toàn tải đỉnh.`);
      } else if (psuWattage >= recommendedWattage) {
        notes.push(`Nguồn [${psuWattage}W] rất dư dả và an toàn cho cấu hình này.`);
      }
    }

    res.json({
      success: true,
      compatible: warnings.length === 0,
      estimatedWattage,
      recommendedWattage,
      warnings,
      notes
    });
  } catch (error) {
    console.error('Error checking compatibility:', error);
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra tính tương thích cấu hình.' });
  }
});

// Pre-built popular presets
router.get('/presets', (req, res) => {
  const presets = [
    {
      id: 'preset-gaming-esports',
      name: 'Chiến Game Esports & AAA 2K',
      badge: 'Bán chạy nhất',
      description: 'Cấu hình cân mượt mọi tựa game AAA ở độ phân giải 2K max settings và làm việc mượt mà.',
      parts: {
        cpu: 'cpu-intel-i5-14600k',
        mainboard: 'mb-msi-mag-b760-tomahawk-wifi',
        ram: 'ram-corsair-vengeance-rgb-32gb-6000',
        vga: 'vga-asus-tuf-rtx-4070-ti-super',
        ssd: 'ssd-samsung-990-pro-1tb',
        psu: 'psu-corsair-rm750e-750w-gold',
        case: 'case-nzxt-h5-flow-black',
        cooling: 'cooling-deepcool-ls720-se-360-black'
      }
    },
    {
      id: 'preset-streamer-workstation',
      name: 'Streamer & Đồ Họa Render 3D',
      badge: 'Hi-End Đỉnh Cao',
      description: 'Sức mạnh từ Ryzen 7 7800X3D và RTX 4080 Super chuyên cho render phim và livestream mượt mà.',
      parts: {
        cpu: 'cpu-amd-ryzen-7-7800x3d',
        mainboard: 'mb-gigabyte-b650-aorus-elite-ax',
        ram: 'ram-gskill-trident-z5-rgb-64gb-6400',
        vga: 'vga-gigabyte-rtx-4080-super-gaming-oc',
        ssd: 'ssd-samsung-990-pro-1tb',
        psu: 'psu-msi-mag-a850gl-850w-gold',
        case: 'case-lian-li-o11-vision-black',
        cooling: 'cooling-deepcool-ls720-se-360-black'
      }
    },
    {
      id: 'preset-budget-gamer',
      name: 'Chiến Game Quốc Dân Tiết Kiệm',
      badge: 'Giá tốt nhất',
      description: 'Lựa chọn tối ưu ngân sách chiến mượt Valorant, CS2, LOL, GTA V, Black Myth Wukong ở 1080p.',
      parts: {
        cpu: 'cpu-amd-ryzen-5-7600x',
        mainboard: 'mb-gigabyte-b650-aorus-elite-ax',
        ram: 'ram-kingston-fury-beast-32gb-5600',
        vga: 'vga-msi-rtx-4060-ventus-2x',
        ssd: 'ssd-kingston-nv2-1tb',
        psu: 'psu-corsair-rm750e-750w-gold',
        case: 'case-nzxt-h5-flow-black',
        cooling: 'cooling-thermalright-peerless-assassin-120-se'
      }
    }
  ];

  res.json({ success: true, data: presets });
});

module.exports = router;
