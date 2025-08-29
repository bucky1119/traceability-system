const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 测试配置
const BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'your-test-token-here'; // 需要替换为实际的token

async function testDetailQrcodeFeatures() {
  try {
    console.log('🧪 开始测试详情页面二维码功能...\n');

    // 1. 测试获取产品详情
    console.log('1. 测试获取产品详情...');
    const productResponse = await axios.get(`${BASE_URL}/products/1`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('✅ 产品详情获取成功:', productResponse.data);
    const product = productResponse.data;

    // 2. 测试获取产品二维码列表
    console.log('\n2. 测试获取产品二维码列表...');
    const qrcodesResponse = await axios.get(`${BASE_URL}/qrcodes?productId=1`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('✅ 二维码列表获取成功:', qrcodesResponse.data);
    const qrcodes = qrcodesResponse.data;

    if (qrcodes.length === 0) {
      console.log('⚠️  该产品暂无二维码，需要先生成二维码');
      
      // 3. 测试生成二维码
      console.log('\n3. 测试生成二维码...');
      const createQrcodeResponse = await axios.post(`${BASE_URL}/qrcodes`, {
        productId: product.id,
        batchId: product.batch.id
      }, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ 二维码生成成功:', createQrcodeResponse.data);
      const qrcode = createQrcodeResponse.data;
      
      // 重新获取二维码列表
      const newQrcodesResponse = await axios.get(`${BASE_URL}/qrcodes?productId=1`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      console.log('✅ 更新后的二维码列表:', newQrcodesResponse.data);
    }

    // 4. 测试二维码图片访问
    console.log('\n4. 测试二维码图片访问...');
    if (qrcodes.length > 0) {
      const qrcode = qrcodes[0];
      const imageUrl = qrcode.qrcodeImageUrl;
      console.log('图片URL:', imageUrl);

      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });

      if (imageResponse.status === 200) {
        console.log('✅ 图片访问成功，大小:', imageResponse.data.length, 'bytes');
        
        // 保存测试图片
        const testImagePath = path.join(__dirname, 'detail-test-qrcode.png');
        fs.writeFileSync(testImagePath, imageResponse.data);
        console.log('✅ 测试图片已保存到:', testImagePath);
      } else {
        console.log('❌ 图片访问失败');
      }
    }

    // 5. 测试二维码下载
    console.log('\n5. 测试二维码下载...');
    if (qrcodes.length > 0) {
      const qrcode = qrcodes[0];
      const downloadResponse = await axios.get(`${BASE_URL}/qrcodes/download/${qrcode.qrcodeId}`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        responseType: 'arraybuffer'
      });

      if (downloadResponse.status === 200) {
        console.log('✅ 下载成功，大小:', downloadResponse.data.length, 'bytes');
        
        // 保存下载的图片
        const downloadImagePath = path.join(__dirname, 'detail-downloaded-qrcode.png');
        fs.writeFileSync(downloadImagePath, downloadResponse.data);
        console.log('✅ 下载的图片已保存到:', downloadImagePath);
        
        // 验证文件是否为有效的PNG
        const buffer = downloadResponse.data;
        const isPNG = buffer.length >= 8 && 
                     buffer[0] === 0x89 && 
                     buffer[1] === 0x50 && 
                     buffer[2] === 0x4E && 
                     buffer[3] === 0x47;
        
        if (isPNG) {
          console.log('✅ 文件格式验证成功：有效的PNG图片');
        } else {
          console.log('❌ 文件格式验证失败：不是有效的PNG图片');
        }
      } else {
        console.log('❌ 下载失败');
      }
    }

    // 6. 测试产品更新（编辑功能）
    console.log('\n6. 测试产品更新功能...');
    const updateData = {
      name: product.name + ' (已更新)',
      origin: product.origin || '测试产地',
      testType: '更新后的检测类型'
    };

    const updateResponse = await axios.patch(`${BASE_URL}/products/${product.id}`, updateData, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (updateResponse.status === 200) {
      console.log('✅ 产品更新成功:', updateResponse.data);
    } else {
      console.log('❌ 产品更新失败');
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
  console.log('2. 数据库中有产品ID为1的数据');
  console.log('3. 已设置正确的测试token\n');
  
  testDetailQrcodeFeatures();
}

module.exports = { testDetailQrcodeFeatures };
