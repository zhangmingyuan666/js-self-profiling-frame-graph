const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const TEST_DATA_DIR = path.join(__dirname, 'src', 'test-data');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    try {
        // 解析请求URL
        const parsedUrl = url.parse(req.url);
        let filePath = parsedUrl.pathname;
        
        // 处理保存数据的API请求
        if (filePath === '/api/save-data' && req.method === 'POST') {
            handleSaveData(req, res);
            return;
        }
        
        // 处理获取test-data目录文件列表的API请求
        if (filePath === '/api/list-test-data' && req.method === 'GET') {
            handleListTestData(req, res);
            return;
        }
        
        // 默认提供HTML文件
        if (filePath === '/') {
            filePath = '/js-self-profiling-demo.html';
        }
        
        // 构建完整的文件路径
        const fullPath = path.join(__dirname, filePath);
        
        // 检查文件是否存在
        if (!fs.existsSync(fullPath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('文件未找到');
            return;
        }
        
        // 读取文件
        const fileStream = fs.createReadStream(fullPath);
        
        // 设置响应头
        // 关键：设置Document-Policy响应头以允许js-self-profiling API
        res.setHeader('Document-Policy', 'js-profiling');
        
        // 根据文件扩展名设置Content-Type
        const ext = path.extname(fullPath);
        let contentType = 'text/plain';
        
        switch (ext) {
            case '.html':
                contentType = 'text/html';
                break;
            case '.js':
                contentType = 'application/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
        }
        
        res.setHeader('Content-Type', contentType);
        
        // 流式传输文件内容
        fileStream.pipe(res);
        
    } catch (err) {
        console.error('服务器错误:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('服务器内部错误');
    }
});

// 处理保存数据的API
function handleSaveData(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `profiling-${timestamp}.json`;
            const filepath = path.join(TEST_DATA_DIR, filename);
            
            // 确保test-data目录存在
            if (!fs.existsSync(TEST_DATA_DIR)) {
                fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
            }
            
            // 写入文件
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
            
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            res.end(JSON.stringify({ 
                success: true, 
                message: '数据保存成功',
                filename: filename,
                filepath: filepath
            }));
            
            console.log(`✅ 数据已保存到: ${filepath}`);
            
        } catch (error) {
            console.error('保存数据时出错:', error);
            res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ 
                success: false, 
                message: '保存数据失败: ' + error.message 
            }));
        }
    });
}

// 处理获取test-data目录文件列表的API
function handleListTestData(req, res) {
    try {
        if (!fs.existsSync(TEST_DATA_DIR)) {
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ files: [] }));
            return;
        }
        
        const files = fs.readdirSync(TEST_DATA_DIR)
            .filter(file => file.endsWith('.json'))
            .map(file => ({
                name: file,
                path: `src/test-data/${file}`,
                size: fs.statSync(path.join(TEST_DATA_DIR, file)).size,
                modified: fs.statSync(path.join(TEST_DATA_DIR, file)).mtime
            }));
        
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ files }));
        
    } catch (error) {
        console.error('获取文件列表时出错:', error);
        res.writeHead(500, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ 
            success: false, 
            message: '获取文件列表失败: ' + error.message 
        }));
    }
}

// 启动服务器
server.listen(PORT, () => {
    console.log(`🚀 服务器已启动在 http://localhost:${PORT}`);
    console.log(`📄 访问 js-self-profiling 演示页面: http://localhost:${PORT}/js-self-profiling-demo.html`);
    console.log(`⚠️  重要提示:`);
    console.log(`   1. 确保使用 Chrome 浏览器访问`);
    console.log(`   2. 服务器已设置 Document-Policy: js-profiling 响应头`);
    console.log(`   3. 如果API不可用，请检查Chrome版本是否支持js-self-profiling`);
    console.log(`\n按 Ctrl+C 停止服务器`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
}); 