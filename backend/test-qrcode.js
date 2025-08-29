const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 测试配置
const BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'your-test-token-here'; // 需要替换为实际的token

async function testQrcodeGeneration() {
  try {
    console.log('🧪 开始测试二维码生成功能...\n');

    // 1. 测试创建二维码
    console.log('1. 测试创建二维码...');
    const createResponse = await axios.post(`${BASE_URL}/qrcodes`, {
      productId: 1, // 假设存在产品ID为1
      batchId: 1    // 假设存在批次ID为1
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ 二维码创建成功:', createResponse.data);
    const qrcodeId = createResponse.data.qrcodeId;

    // 2. 测试获取二维码图片信息
    console.log('\n2. 测试获取二维码图片信息...');
    const imageInfoResponse = await axios.get(`${BASE_URL}/qrcodes/image-info/${qrcodeId}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('✅ 图片信息获取成功:', imageInfoResponse.data);

    // 3. 测试访问二维码图片
    console.log('\n3. 测试访问二维码图片...');
    const imageUrl = imageInfoResponse.data.imageUrl;
    console.log('图片URL:', imageUrl);

    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    if (imageResponse.status === 200) {
      console.log('✅ 图片访问成功，大小:', imageResponse.data.length, 'bytes');
      
      // 保存测试图片
      const testImagePath = path.join(__dirname, 'test-qrcode.png');
      fs.writeFileSync(testImagePath, imageResponse.data);
      console.log('✅ 测试图片已保存到:', testImagePath);
    } else {
      console.log('❌ 图片访问失败');
    }

    // 4. 测试下载二维码
    console.log('\n4. 测试下载二维码...');
    const downloadResponse = await axios.get(`${BASE_URL}/qrcodes/download/${qrcodeId}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      responseType: 'arraybuffer'
    });

    if (downloadResponse.status === 200) {
      console.log('✅ 下载成功，大小:', downloadResponse.data.length, 'bytes');
      
      // 保存下载的图片
      const downloadImagePath = path.join(__dirname, 'downloaded-qrcode.png');
      fs.writeFileSync(downloadImagePath, downloadResponse.data);
      console.log('✅ 下载的图片已保存到:', downloadImagePath);
    } else {
      console.log('❌ 下载失败');
    }

    // 5. 测试预览二维码
    console.log('\n5. 测试预览二维码...');
    const previewResponse = await axios.get(`${BASE_URL}/qrcodes/preview/${qrcodeId}`, {
      responseType: 'arraybuffer'
    });

    if (previewResponse.status === 200) {
      console.log('✅ 预览成功，大小:', previewResponse.data.length, 'bytes');
      
      // 保存预览图片
      const previewImagePath = path.join(__dirname, 'preview-qrcode.png');
      fs.writeFileSync(previewImagePath, previewResponse.data);
      console.log('✅ 预览图片已保存到:', previewImagePath);
    } else {
      console.log('❌ 预览失败');
    }

    console.log('\n🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', error.response.headers);
    }
  }
}

// 运行测试
if (require.main === module) {
  console.log('请确保：');
  console.log('1. 后端服务正在运行 (http://localhost:3000)');
  console.log('2. 数据库中有产品ID为1和批次ID为1的数据');
  console.log('3. 已设置正确的测试token\n');
  
  testQrcodeGeneration();
}

module.exports = { testQrcodeGeneration };
