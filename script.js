let jsonData = null;
let collapsedLevels = new Set();

// JSON格式化相关功能
function validateJson() {
    const input = document.getElementById('jsonInput');
    const status = document.getElementById('inputStatus');
    const charCount = document.getElementById('charCount');
    const lineCount = document.getElementById('lineCount');
    
    const text = input.value;
    charCount.textContent = text.length;
    lineCount.textContent = text.split('\n').length;
    
    if (!text.trim()) {
        status.textContent = '等待输入...';
        status.className = '';
        return;
    }
    
    try {
        JSON.parse(text);
        status.textContent = '✅ JSON格式有效';
        status.className = 'status-valid';
    } catch (e) {
        status.textContent = `❌ JSON格式错误: ${e.message}`;
        status.className = 'status-invalid';
    }
}

function formatJson() {
    const input = document.getElementById('jsonInput').value;
    const output = document.getElementById('jsonOutput');
    const outputStatus = document.getElementById('outputStatus');
    
    if (!input.trim()) {
        outputStatus.textContent = '请输入JSON数据';
        outputStatus.className = 'status-invalid';
        return;
    }
    
    try {
        jsonData = JSON.parse(input);
        const formatted = renderJsonWithCollapse(jsonData, 0);
        output.innerHTML = formatted;
        outputStatus.textContent = '✅ 格式化成功';
        outputStatus.className = 'status-valid';
        updateStats(jsonData);
    } catch (e) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `解析错误: ${e.message}`;
        output.innerHTML = '';
        output.appendChild(errorDiv);
        outputStatus.textContent = '❌ 格式化失败';
        outputStatus.className = 'status-invalid';
    }
}

function minifyJson() {
    const input = document.getElementById('jsonInput').value;
    const inputElement = document.getElementById('jsonInput');
    
    if (!input.trim()) return;
    
    try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        inputElement.value = minified;
        validateJson();
    } catch (e) {
        alert('JSON格式错误，无法压缩');
    }
}

// 新增：JSON字符串转义功能
function escapeJsonString() {
    const input = document.getElementById('jsonInput').value;
    const inputElement = document.getElementById('jsonInput');
    
    if (!input.trim()) {
        alert('请输入要转义的JSON数据');
        return;
    }
    
    try {
        // 验证是否为有效JSON
        JSON.parse(input);
        // 转义为字符串
        const escaped = JSON.stringify(input);
        inputElement.value = escaped;
        validateJson();
    } catch (e) {
        alert('JSON格式错误，无法转义');
    }
}

// 新增：JSON字符串反转义功能
function unescapeJsonString() {
    const input = document.getElementById('jsonInput').value;
    const inputElement = document.getElementById('jsonInput');
    
    if (!input.trim()) {
        alert('请输入要反转义的JSON字符串');
        return;
    }
    
    try {
        // 尝试解析字符串
        const unescaped = JSON.parse(input);
        if (typeof unescaped === 'string') {
            // 验证反转义后是否为有效JSON
            JSON.parse(unescaped);
            inputElement.value = unescaped;
            validateJson();
        } else {
            alert('输入的不是JSON字符串格式');
        }
    } catch (e) {
        alert('反转义失败，请检查输入格式');
    }
}

function clearInput() {
    document.getElementById('jsonInput').value = '';
    document.getElementById('jsonOutput').innerHTML = '';
    document.getElementById('inputStatus').textContent = '等待输入...';
    document.getElementById('inputStatus').className = '';
    document.getElementById('outputStatus').textContent = '等待格式化...';
    document.getElementById('outputStatus').className = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('lineCount').textContent = '0';
    resetStats();
}

function loadSample() {
    const sample = {
        "name": "张三",
        "age": 28,
        "email": "zhangsan@example.com",
        "address": {
            "country": "中国",
            "city": "北京",
            "street": "中关村大街1号",
            "zipCode": "100000"
        },
        "hobbies": ["读书", "游泳", "编程"],
        "education": {
            "university": "清华大学",
            "major": "计算机科学",
            "degree": "硕士",
            "graduationYear": 2020
        },
        "skills": [
            {"name": "JavaScript", "level": "高级"},
            {"name": "Python", "level": "中级"},
            {"name": "Java", "level": "高级"}
        ],
        "isActive": true,
        "lastLogin": null
    };
    
    document.getElementById('jsonInput').value = JSON.stringify(sample, null, 2);
    validateJson();
}

function renderJsonWithCollapse(obj, level, path = '') {
    if (obj === null) {
        return '<span class="json-null">null</span>';
    }
    
    if (typeof obj === 'string') {
        return `<span class="json-string">"${escapeHtml(obj)}"</span>`;
    }
    
    if (typeof obj === 'number') {
        return `<span class="json-number">${obj}</span>`;
    }
    
    if (typeof obj === 'boolean') {
        return `<span class="json-boolean">${obj}</span>`;
    }
    
    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            return '<span class="json-bracket">[]</span>';
        }
        
        const collapseId = `collapse-${path}-${level}`;
        const isCollapsed = collapsedLevels.has(collapseId);
        
        let result = `<button class="collapse-btn" onclick="toggleCollapse('${collapseId}')">${isCollapsed ? '+' : '-'}</button>`;
        result += '<span class="json-bracket">[</span>';
        
        if (isCollapsed) {
            result += `<span class="json-comment"> ... ${obj.length} items</span>`;
        } else {
            result += `<div id="${collapseId}" class="${isCollapsed ? 'collapsed' : ''}">`;
            for (let i = 0; i < obj.length; i++) {
                const itemPath = `${path}[${i}]`;
                result += '<div class="json-line" style="margin-left: 20px;">';
                result += renderJsonWithCollapse(obj[i], level + 1, itemPath);
                if (i < obj.length - 1) result += ',';
                result += '</div>';
            }
            result += '</div>';
        }
        
        result += '<span class="json-bracket">]</span>';
        return result;
    }
    
    if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            return '<span class="json-bracket">{}</span>';
        }
        
        const collapseId = `collapse-${path}-${level}`;
        const isCollapsed = collapsedLevels.has(collapseId);
        
        let result = `<button class="collapse-btn" onclick="toggleCollapse('${collapseId}')">${isCollapsed ? '+' : '-'}</button>`;
        result += '<span class="json-bracket">{</span>';
        
        if (isCollapsed) {
            result += `<span class="json-comment"> ... ${keys.length} properties</span>`;
        } else {
            result += `<div id="${collapseId}" class="${isCollapsed ? 'collapsed' : ''}">`;
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const itemPath = `${path}.${key}`;
                result += '<div class="json-line" style="margin-left: 20px;">';
                result += `<span class="json-key">"${escapeHtml(key)}"</span>: `;
                result += renderJsonWithCollapse(obj[key], level + 1, itemPath);
                if (i < keys.length - 1) result += ',';
                result += '</div>';
            }
            result += '</div>';
        }
        
        result += '<span class="json-bracket">}</span>';
        return result;
    }
    
    return String(obj);
}

function toggleCollapse(collapseId) {
    const element = document.getElementById(collapseId);
    const button = element.previousElementSibling;
    
    if (collapsedLevels.has(collapseId)) {
        collapsedLevels.delete(collapseId);
        element.classList.remove('collapsed');
        button.textContent = '-';
    } else {
        collapsedLevels.add(collapseId);
        element.classList.add('collapsed');
        button.textContent = '+';
    }
}

function collapseLevel(targetLevel) {
    if (!jsonData) return;
    
    collapsedLevels.clear();
    addCollapseAtLevel(jsonData, 0, targetLevel, '');
    formatJson();
}

function addCollapseAtLevel(obj, currentLevel, targetLevel, path) {
    if (currentLevel >= targetLevel) {
        const collapseId = `collapse-${path}-${currentLevel}`;
        collapsedLevels.add(collapseId);
        return;
    }
    
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const itemPath = `${path}[${i}]`;
            addCollapseAtLevel(obj[i], currentLevel + 1, targetLevel, itemPath);
        }
    } else if (typeof obj === 'object' && obj !== null) {
        const keys = Object.keys(obj);
        for (const key of keys) {
            const itemPath = `${path}.${key}`;
            addCollapseAtLevel(obj[key], currentLevel + 1, targetLevel, itemPath);
        }
    }
}

function expandAll() {
    collapsedLevels.clear();
    formatJson();
}

function copyOutput() {
    if (!jsonData) return;
    
    const formatted = JSON.stringify(jsonData, null, 2);
    navigator.clipboard.writeText(formatted).then(() => {
        const button = event.target.closest('.btn');
        const originalText = button.innerHTML;
        button.innerHTML = '<span>✅</span> 已复制';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    });
}

function updateStats(obj) {
    const stats = analyzeJson(obj);
    document.getElementById('objectCount').textContent = stats.objects;
    document.getElementById('arrayCount').textContent = stats.arrays;
    document.getElementById('maxDepth').textContent = stats.maxDepth;
}

function analyzeJson(obj, depth = 0) {
    let stats = {
        objects: 0,
        arrays: 0,
        maxDepth: depth
    };
    
    if (Array.isArray(obj)) {
        stats.arrays++;
        for (const item of obj) {
            const itemStats = analyzeJson(item, depth + 1);
            stats.objects += itemStats.objects;
            stats.arrays += itemStats.arrays;
            stats.maxDepth = Math.max(stats.maxDepth, itemStats.maxDepth);
        }
    } else if (typeof obj === 'object' && obj !== null) {
        stats.objects++;
        for (const key in obj) {
            const itemStats = analyzeJson(obj[key], depth + 1);
            stats.objects += itemStats.objects;
            stats.arrays += itemStats.arrays;
            stats.maxDepth = Math.max(stats.maxDepth, itemStats.maxDepth);
        }
    }
    
    return stats;
}

function resetStats() {
    document.getElementById('objectCount').textContent = '0';
    document.getElementById('arrayCount').textContent = '0';
    document.getElementById('maxDepth').textContent = '0';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 导航功能
// Markdown编辑器工具栏函数
function insertMarkdown(prefix, suffix) {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = prefix + (selectedText || '文本') + suffix;
    
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    
    // 设置光标位置
    const newCursorPos = selectedText ? start + replacement.length : start + prefix.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    // 触发预览更新
    updateMarkdownPreview();
}

function insertHeading(level) {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;
    
    const prefix = '#'.repeat(level) + ' ';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = prefix + (selectedText || `${level}级标题`);
    
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    
    const newCursorPos = start + replacement.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    updateMarkdownPreview();
}

function insertList(prefix) {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = prefix + (selectedText || '列表项');
    
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    
    const newCursorPos = start + replacement.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    updateMarkdownPreview();
}

function insertQuote() {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = '> ' + (selectedText || '引用文本');
    
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    
    const newCursorPos = start + replacement.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    updateMarkdownPreview();
}

function insertLink() {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = `[${selectedText || '链接文本'}](url)`;
    
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    
    const newCursorPos = selectedText ? start + replacement.length - 4 : start + replacement.length - 9;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    updateMarkdownPreview();
}

function insertImage() {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = `![${selectedText || '图片描述'}](url)`;
    
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    
    const newCursorPos = selectedText ? start + replacement.length - 4 : start + replacement.length - 10;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    updateMarkdownPreview();
}

function insertTable() {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const replacement = '| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |';
    
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(start);
    
    const newCursorPos = start + replacement.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    updateMarkdownPreview();
}

function clearMarkdown() {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;
    
    textarea.value = '';
    updateMarkdownPreview();
    textarea.focus();
}

function copyMarkdown() {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;
    
    navigator.clipboard.writeText(textarea.value).then(() => {
        showMessage('Markdown内容已复制到剪贴板', 'success');
    }).catch(() => {
        showMessage('复制失败', 'error');
    });
}

function toggleMobileMenu() {
    const navbarNav = document.getElementById('navbarNav');
    navbarNav.classList.toggle('active');
}

// 图片Base64互转工具功能
let currentMode = 'toBase64';
let currentImage = null;
let showDataURL = false;

function switchMode(mode) {
    currentMode = mode;
    
    // 更新按钮状态
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // 显示/隐藏相应模式
    document.getElementById('toBase64Mode').style.display = mode === 'toBase64' ? 'block' : 'none';
    document.getElementById('toImageMode').style.display = mode === 'toImage' ? 'block' : 'none';
    
    // 重置状态
    if (mode === 'toBase64') {
        clearImage();
    } else {
        clearBase64Input();
    }
}

// 图片上传处理
function initImageUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    if (fileInput && uploadArea) {
        fileInput.addEventListener('change', handleFileSelect);
        
        // 拖拽功能
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('click', () => fileInput.click());
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processImageFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processImageFile(files[0]);
    }
}

function processImageFile(file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        showError('请选择图片文件');
        return;
    }
    
    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('文件大小不能超过10MB');
        return;
    }
    
    currentImage = file;
    
    // 显示文件信息
    updateFileInfo(file);
    
    // 读取并显示图片
    const reader = new FileReader();
    reader.onload = function(e) {
        displayImage(e.target.result, file);
    };
    reader.readAsDataURL(file);
}

function updateFileInfo(file) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileType').textContent = file.type;
}

function displayImage(dataUrl, file) {
    const preview = document.getElementById('imagePreview');
    preview.src = dataUrl;
    preview.onload = function() {
        document.getElementById('imageDimensions').textContent = `${this.naturalWidth} × ${this.naturalHeight}`;
        document.getElementById('imagePreviewSection').style.display = 'block';
        generateBase64(dataUrl, file);
    };
}

function generateBase64(dataUrl, file) {
    const base64Data = showDataURL ? dataUrl : dataUrl.split(',')[1];
    const output = document.getElementById('base64Output');
    output.value = base64Data;
    
    // 更新统计信息
    document.getElementById('base64Length').textContent = base64Data.length.toLocaleString();
    
    const compressionRatio = ((file.size / base64Data.length) * 100).toFixed(1);
    document.getElementById('compressionRatio').textContent = compressionRatio + '%';
    
    document.getElementById('base64OutputSection').style.display = 'block';
}

function toggleDataURL() {
    if (!currentImage) return;
    
    showDataURL = !showDataURL;
    const toggleIcon = document.getElementById('dataURLToggleIcon');
    const toggleText = document.getElementById('dataURLToggleText');
    
    if (showDataURL) {
        toggleIcon.textContent = '🔗';
        toggleText.textContent = '仅显示Base64';
    } else {
        toggleIcon.textContent = '📄';
        toggleText.textContent = '显示Data URL';
    }
    
    // 重新生成Base64
    const preview = document.getElementById('imagePreview');
    const reader = new FileReader();
    reader.onload = function(e) {
        generateBase64(e.target.result, currentImage);
    };
    reader.readAsDataURL(currentImage);
}

function copyBase64() {
    const output = document.getElementById('base64Output');
    output.select();
    document.execCommand('copy');
    showSuccess('Base64编码已复制到剪贴板');
}

function downloadBase64() {
    const output = document.getElementById('base64Output');
    const content = output.value;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'base64-encoded.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function clearImage() {
    currentImage = null;
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
    
    const imagePreviewSection = document.getElementById('imagePreviewSection');
    if (imagePreviewSection) imagePreviewSection.style.display = 'none';
    
    const base64OutputSection = document.getElementById('base64OutputSection');
    if (base64OutputSection) base64OutputSection.style.display = 'none';
    
    const base64Output = document.getElementById('base64Output');
    if (base64Output) base64Output.value = '';
    
    showDataURL = false;
    
    // 重置切换按钮状态
    const toggleIcon = document.getElementById('dataURLToggleIcon');
    const toggleText = document.getElementById('dataURLToggleText');
    if (toggleIcon) toggleIcon.textContent = '🔗';
    if (toggleText) toggleText.textContent = '显示Data URL';
}

// Base64转图片功能
function decodeBase64() {
    const input = document.getElementById('base64Input').value.trim();
    if (!input) {
        showError('请输入Base64编码');
        return;
    }
    
    try {
        let base64Data = input;
        let mimeType = 'image/png'; // 默认类型
        
        // 检查是否是Data URL格式
        if (input.startsWith('data:')) {
            const matches = input.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                mimeType = matches[1];
                base64Data = matches[2];
            } else {
                throw new Error('无效的Data URL格式');
            }
        }
        
        // 验证Base64格式
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
            throw new Error('无效的Base64编码');
        }
        
        // 创建图片
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        const img = document.getElementById('decodedImage');
        
        img.onload = function() {
            document.getElementById('decodedDimensions').textContent = `${this.naturalWidth} × ${this.naturalHeight}`;
            document.getElementById('decodedFormat').textContent = mimeType;
            
            // 计算预计文件大小
            const estimatedSize = (base64Data.length * 0.75);
            document.getElementById('decodedSize').textContent = formatFileSize(estimatedSize);
            
            document.getElementById('decodedImageSection').style.display = 'block';
            updateBase64InputStatus('✅ 解码成功', 'status-valid');
        };
        
        img.onerror = function() {
            throw new Error('无法解码图片，请检查Base64编码是否正确');
        };
        
        img.src = dataUrl;
        
    } catch (error) {
        showError('解码失败: ' + error.message);
        updateBase64InputStatus('❌ 解码失败', 'status-invalid');
    }
}

function pasteBase64() {
    navigator.clipboard.readText().then(text => {
        document.getElementById('base64Input').value = text;
        updateBase64InputLength();
    }).catch(err => {
        showError('无法访问剪贴板');
    });
}

function clearBase64Input() {
    const base64Input = document.getElementById('base64Input');
    if (base64Input) base64Input.value = '';
    
    const decodedImageSection = document.getElementById('decodedImageSection');
    if (decodedImageSection) decodedImageSection.style.display = 'none';
    
    updateBase64InputLength();
    updateBase64InputStatus('等待输入...', '');
}

function downloadDecodedImage() {
    const img = document.getElementById('decodedImage');
    if (!img.src) return;
    
    const a = document.createElement('a');
    a.href = img.src;
    a.download = 'decoded-image.png';
    a.click();
}

function copyDecodedImage() {
    const img = document.getElementById('decodedImage');
    if (!img.src) return;
    
    // 创建canvas来复制图片
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    
    canvas.toBlob(blob => {
        const item = new ClipboardItem({'image/png': blob});
        navigator.clipboard.write([item]).then(() => {
            showSuccess('图片已复制到剪贴板');
        }).catch(err => {
            showError('复制失败，请手动右键保存图片');
        });
    });
}

function updateBase64InputLength() {
    const input = document.getElementById('base64Input');
    const lengthElement = document.getElementById('base64InputLength');
    if (input && lengthElement) {
        const length = input.value.length;
        lengthElement.textContent = length.toLocaleString();
    }
}

function updateBase64InputStatus(message, className) {
    const status = document.getElementById('base64InputStatus');
    if (status) {
        status.textContent = message;
        status.className = className;
    }
}

// 工具函数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showError(message) {
    // 创建错误提示
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-display';
    errorDiv.textContent = message;
    
    // 添加到当前模式的容器中
    const container = currentMode === 'toBase64' ? 
        document.getElementById('toBase64Mode') : 
        document.getElementById('toImageMode');
    if (container) {
        container.appendChild(errorDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
}

function showSuccess(message) {
    // 创建成功提示
    const successDiv = document.createElement('div');
    successDiv.className = 'success-display';
    successDiv.textContent = message;
    
    // 添加到当前模式的容器中
    const container = currentMode === 'toBase64' ? 
        document.getElementById('toBase64Mode') : 
        document.getElementById('toImageMode');
    if (container) {
        container.appendChild(successDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}

// Markdown编辑器功能
function initMarkdownEditor() {
    const textarea = document.getElementById('markdownInput');
    const preview = document.getElementById('markdownPreview');
    const charCount = document.getElementById('charCount');
    const lineCount = document.getElementById('lineCount');
    
    if (!textarea || !preview) return;
    
    // 实时预览
    function updatePreview() {
        const markdown = textarea.value;
        preview.innerHTML = parseMarkdown(markdown);
        
        // 更新统计信息
        if (charCount) charCount.textContent = markdown.length;
        if (lineCount) lineCount.textContent = markdown.split('\n').length;
    }
    
    textarea.addEventListener('input', updatePreview);
    textarea.addEventListener('scroll', syncScroll);
    
    // 同步滚动
    function syncScroll() {
        const scrollPercent = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
        preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight);
    }
    
    // 工具栏按钮事件
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            handleToolbarAction(action, textarea);
        });
    });
    
    // 初始化预览
    updatePreview();
}

// 处理工具栏操作
function handleToolbarAction(action, textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';
    let cursorOffset = 0;
    
    switch(action) {
        case 'bold':
            replacement = `**${selectedText || '粗体文本'}**`;
            cursorOffset = selectedText ? 0 : -2;
            break;
        case 'italic':
            replacement = `*${selectedText || '斜体文本'}*`;
            cursorOffset = selectedText ? 0 : -1;
            break;
        case 'strikethrough':
            replacement = `~~${selectedText || '删除线文本'}~~`;
            cursorOffset = selectedText ? 0 : -2;
            break;
        case 'code':
            replacement = `\`${selectedText || '代码'}\``;
            cursorOffset = selectedText ? 0 : -1;
            break;
        case 'h1':
            replacement = `# ${selectedText || '一级标题'}`;
            cursorOffset = selectedText ? 0 : 0;
            break;
        case 'h2':
            replacement = `## ${selectedText || '二级标题'}`;
            cursorOffset = selectedText ? 0 : 0;
            break;
        case 'h3':
            replacement = `### ${selectedText || '三级标题'}`;
            cursorOffset = selectedText ? 0 : 0;
            break;
        case 'ul':
            replacement = `- ${selectedText || '列表项'}`;
            cursorOffset = selectedText ? 0 : 0;
            break;
        case 'ol':
            replacement = `1. ${selectedText || '列表项'}`;
            cursorOffset = selectedText ? 0 : 0;
            break;
        case 'quote':
            replacement = `> ${selectedText || '引用文本'}`;
            cursorOffset = selectedText ? 0 : 0;
            break;
        case 'link':
            replacement = `[${selectedText || '链接文本'}](url)`;
            cursorOffset = selectedText ? -5 : -9;
            break;
        case 'image':
            replacement = `![${selectedText || '图片描述'}](url)`;
            cursorOffset = selectedText ? -5 : -10;
            break;
        case 'table':
            replacement = `| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |`;
            cursorOffset = 0;
            break;
        case 'clear':
            textarea.value = '';
            textarea.dispatchEvent(new Event('input'));
            return;
        case 'copy':
            navigator.clipboard.writeText(textarea.value).then(() => {
                showMessage('Markdown内容已复制到剪贴板', 'success');
            });
            return;
    }
    
    // 替换选中文本
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    
    // 设置光标位置
    const newCursorPos = start + replacement.length + cursorOffset;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    // 触发输入事件更新预览
    textarea.dispatchEvent(new Event('input'));
}

// 简单的Markdown解析器
function parseMarkdown(markdown) {
    let html = markdown
        // 标题
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // 粗体和斜体
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // 删除线
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        // 行内代码
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // 链接
        .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        // 图片
        .replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">')
        // 引用
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // 无序列表
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        // 有序列表
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        // 代码块
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // 水平线
        .replace(/^---$/gim, '<hr>')
        // 段落
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // 包装列表项
    html = html.replace(/(<li>.*<\/li>)/gs, function(match) {
        if (match.includes('1.')) {
            return '<ol>' + match + '</ol>';
        } else {
            return '<ul>' + match + '</ul>';
        }
    });
    
    // 包装段落
    if (html && !html.startsWith('<')) {
        html = '<p>' + html + '</p>';
    }
    
    return html;
}

// M3U8播放器功能
function initM3U8Player() {
    const urlInput = document.getElementById('m3u8UrlInput');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoInfo = document.getElementById('videoInfo');
    
    if (!urlInput || !videoPlayer) return;
    
    // 粘贴按钮
    const pasteBtn = document.querySelector('[data-action="paste-url"]');
    if (pasteBtn) {
        pasteBtn.addEventListener('click', async function() {
            try {
                const text = await navigator.clipboard.readText();
                urlInput.value = text;
                showMessage('链接已粘贴', 'success');
            } catch (err) {
                showMessage('粘贴失败，请手动输入', 'error');
            }
        });
    }
    
    // 清空按钮
    const clearBtn = document.querySelector('[data-action="clear-url"]');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            urlInput.value = '';
            videoPlayer.src = '';
            if (videoInfo) {
                videoInfo.innerHTML = '<p>请输入M3U8链接并点击播放</p>';
            }
        });
    }
    
    // 播放按钮
    const playBtn = document.querySelector('[data-action="play-video"]');
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            const url = urlInput.value.trim();
            if (!url) {
                showMessage('请输入M3U8链接', 'error');
                return;
            }
            
            if (!isValidM3U8Url(url)) {
                showMessage('请输入有效的M3U8链接', 'error');
                return;
            }
            
            loadM3U8Video(url);
        });
    }
    
    // 全屏按钮
    const fullscreenBtn = document.querySelector('[data-action="fullscreen"]');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
            } else if (videoPlayer.webkitRequestFullscreen) {
                videoPlayer.webkitRequestFullscreen();
            } else if (videoPlayer.msRequestFullscreen) {
                videoPlayer.msRequestFullscreen();
            }
        });
    }
    
    // 下载按钮
    const downloadBtn = document.querySelector('[data-action="download"]');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const url = urlInput.value.trim();
            if (url) {
                window.open(url, '_blank');
            } else {
                showMessage('请先加载视频', 'error');
            }
        });
    }
    
    // 分享按钮
    const shareBtn = document.querySelector('[data-action="share"]');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const url = urlInput.value.trim();
            if (url) {
                navigator.clipboard.writeText(url).then(() => {
                    showMessage('视频链接已复制到剪贴板', 'success');
                });
            } else {
                showMessage('请先输入视频链接', 'error');
            }
        });
    }
}

// 验证M3U8链接
function isValidM3U8Url(url) {
    try {
        const urlObj = new URL(url);
        return url.toLowerCase().includes('.m3u8') || 
               url.toLowerCase().includes('m3u8') ||
               urlObj.pathname.toLowerCase().endsWith('.m3u8');
    } catch {
        return false;
    }
}

// 加载M3U8视频
function loadM3U8Video(url) {
    const videoPlayer = document.getElementById('videoPlayer');
    const videoInfo = document.getElementById('videoInfo');
    
    // 检查是否支持HLS
    if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        // 原生支持HLS (Safari)
        videoPlayer.src = url;
        updateVideoInfo(url, '原生HLS支持');
    } else if (window.Hls && Hls.isSupported()) {
        // 使用hls.js
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoPlayer);
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            updateVideoInfo(url, 'HLS.js加载');
            showMessage('视频加载成功', 'success');
        });
        
        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('HLS错误:', data);
            showMessage('视频加载失败: ' + data.details, 'error');
        });
    } else {
        // 尝试直接播放
        videoPlayer.src = url;
        updateVideoInfo(url, '直接播放');
        showMessage('正在尝试播放，如果失败请检查链接或浏览器兼容性', 'warning');
    }
}

// 更新视频信息
function updateVideoInfo(url, method) {
    const videoInfo = document.getElementById('videoInfo');
    if (videoInfo) {
        videoInfo.innerHTML = `
            <p><strong>视频链接:</strong> ${url}</p>
            <p><strong>加载方式:</strong> ${method}</p>
            <p><strong>状态:</strong> 已加载</p>
        `;
    }
}

// 通用消息显示函数
function showMessage(message, type) {
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-display ${type}`;
    messageDiv.textContent = message;
    
    // 添加样式
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // 根据类型设置背景色
    switch(type) {
        case 'success':
            messageDiv.style.backgroundColor = '#10b981';
            break;
        case 'error':
            messageDiv.style.backgroundColor = '#ef4444';
            break;
        case 'warning':
            messageDiv.style.backgroundColor = '#f59e0b';
            break;
        default:
            messageDiv.style.backgroundColor = '#6b7280';
    }
    
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                messageDiv.parentNode.removeChild(messageDiv);
            }, 300);
        }
    }, 3000);
}

// 导航功能
function toggleMobileMenu() {
    const navbarNav = document.getElementById('navbarNav');
    if (navbarNav) {
        navbarNav.classList.toggle('active');
    }
}

function switchTool(tool) {
    // 隐藏所有工具
    document.getElementById('jsonTool').style.display = 'none';
    document.getElementById('imageTool').style.display = 'none';
    document.getElementById('markdownTool').style.display = 'none';
    document.getElementById('m3u8Tool').style.display = 'none';
    document.getElementById('audioTool').style.display = 'none';
    
    // 移除所有导航链接的active类
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // 显示选中的工具并激活对应导航
    switch(tool) {
        case 'json':
            document.getElementById('jsonTool').style.display = 'block';
            document.querySelector('[onclick="switchTool(\'json\')"]').classList.add('active');
            break;
        case 'image':
            document.getElementById('imageTool').style.display = 'block';
            document.querySelector('[onclick="switchTool(\'image\')"]').classList.add('active');
            break;
        case 'markdown':
            document.getElementById('markdownTool').style.display = 'block';
            document.querySelector('[onclick="switchTool(\'markdown\')"]').classList.add('active');
            break;
        case 'm3u8':
            document.getElementById('m3u8Tool').style.display = 'block';
            document.querySelector('[onclick="switchTool(\'m3u8\')"]').classList.add('active');
            break;
        case 'audio':
            document.getElementById('audioTool').style.display = 'block';
            document.querySelector('[onclick="switchTool(\'audio\')"]').classList.add('active');
            break;
    }
}

// Markdown编辑器HTML事件处理函数
function updateMarkdownPreview() {
    const textarea = document.getElementById('markdownInput');
    const preview = document.getElementById('markdownPreview');
    const charCount = document.getElementById('markdownCharCount');
    const lineCount = document.getElementById('markdownLineCount');
    
    if (!textarea || !preview) return;
    
    const markdown = textarea.value;
    preview.innerHTML = parseMarkdown(markdown);
    
    // 更新统计信息
    if (charCount) charCount.textContent = markdown.length;
    if (lineCount) lineCount.textContent = markdown.split('\n').length;
}

function togglePreviewMode() {
    // 预览模式切换功能（可以后续扩展）
    showMessage('预览模式功能开发中', 'info');
}

// M3U8播放器HTML事件处理函数
function pasteM3u8Url() {
    navigator.clipboard.readText().then(text => {
        document.getElementById('m3u8UrlInput').value = text;
        showMessage('链接已粘贴', 'success');
    }).catch(err => {
        showMessage('粘贴失败，请手动输入', 'error');
    });
}

function clearM3u8Input() {
    const urlInput = document.getElementById('m3u8UrlInput');
    const videoPlayer = document.getElementById('m3u8Player');
    const videoInfo = document.getElementById('videoInfo');
    const videoSection = document.getElementById('videoPlayerSection');
    
    if (urlInput) urlInput.value = '';
    if (videoPlayer) videoPlayer.src = '';
    if (videoInfo) videoInfo.style.display = 'none';
    if (videoSection) videoSection.style.display = 'none';
}

function loadM3u8Video() {
    const urlInput = document.getElementById('m3u8UrlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        showMessage('请输入M3U8链接', 'error');
        return;
    }
    
    if (!isValidM3U8Url(url)) {
        showMessage('请输入有效的M3U8链接', 'error');
        return;
    }
    
    loadM3U8VideoPlayer(url);
}

function handleM3u8KeyPress(event) {
    if (event.key === 'Enter') {
        loadM3u8Video();
    }
}

function toggleFullscreen() {
    const videoPlayer = document.getElementById('m3u8Player');
    if (videoPlayer.requestFullscreen) {
        videoPlayer.requestFullscreen();
    } else if (videoPlayer.webkitRequestFullscreen) {
        videoPlayer.webkitRequestFullscreen();
    } else if (videoPlayer.msRequestFullscreen) {
        videoPlayer.msRequestFullscreen();
    }
}

function downloadVideo() {
    const url = document.getElementById('m3u8UrlInput').value.trim();
    if (url) {
        window.open(url, '_blank');
    } else {
        showMessage('请先加载视频', 'error');
    }
}

function shareVideo() {
    const url = document.getElementById('m3u8UrlInput').value.trim();
    if (url) {
        navigator.clipboard.writeText(url).then(() => {
            showMessage('视频链接已复制到剪贴板', 'success');
        });
    } else {
        showMessage('请先输入视频链接', 'error');
    }
}

// 修改加载M3U8视频的函数名
function loadM3U8VideoPlayer(url) {
    const videoPlayer = document.getElementById('m3u8Player');
    const videoInfo = document.getElementById('videoInfo');
    const videoSection = document.getElementById('videoPlayerSection');
    
    // 显示播放器区域
    if (videoSection) videoSection.style.display = 'block';
    
    // 检查是否支持HLS
    if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        // 原生支持HLS (Safari)
        videoPlayer.src = url;
        updateM3U8VideoInfo(url, '原生HLS支持');
    } else if (window.Hls && Hls.isSupported()) {
        // 使用hls.js
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoPlayer);
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            updateM3U8VideoInfo(url, 'HLS.js加载');
            showMessage('视频加载成功', 'success');
        });
        
        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('HLS错误:', data);
            showMessage('视频加载失败: ' + data.details, 'error');
        });
    } else {
        // 尝试直接播放
        videoPlayer.src = url;
        updateM3U8VideoInfo(url, '直接播放');
        showMessage('正在尝试播放，如果失败请检查链接或浏览器兼容性', 'warning');
    }
}

// 更新M3U8视频信息
function updateM3U8VideoInfo(url, method) {
    const videoInfo = document.getElementById('videoInfo');
    const currentVideoUrl = document.getElementById('currentVideoUrl');
    
    if (videoInfo) videoInfo.style.display = 'block';
    if (currentVideoUrl) currentVideoUrl.textContent = url;
    
    // 监听视频元数据加载
    const videoPlayer = document.getElementById('m3u8Player');
    videoPlayer.addEventListener('loadedmetadata', function() {
        const duration = document.getElementById('videoDuration');
        const resolution = document.getElementById('videoResolution');
        
        if (duration) {
            const minutes = Math.floor(videoPlayer.duration / 60);
            const seconds = Math.floor(videoPlayer.duration % 60);
            duration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (resolution) {
            resolution.textContent = `${videoPlayer.videoWidth} × ${videoPlayer.videoHeight}`;
        }
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    validateJson();
    
    const base64Input = document.getElementById('base64Input');
    if (base64Input) {
        base64Input.addEventListener('input', updateBase64InputLength);
    }
    
    initImageUpload();
    initMarkdownEditor();
    initM3U8Player();
    initAudioUpload();
    
    // 点击页面其他地方关闭移动菜单
    document.addEventListener('click', function(event) {
        const navbar = document.querySelector('.navbar');
        const navbarNav = document.getElementById('navbarNav');
        const toggleButton = document.querySelector('.mobile-menu-toggle');
        
        if (navbar && navbarNav && !navbar.contains(event.target) && navbarNav.classList.contains('active')) {
            navbarNav.classList.remove('active');
        }
    });
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== 音频Base64互转工具功能 ====================
let currentAudioMode = 'toBase64';
let currentAudioFile = null;
let showAudioDataURL = false;

function switchAudioMode(mode) {
    currentAudioMode = mode;
    
    // 更新按钮状态
    document.querySelectorAll('#audioTool .mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`#audioTool [data-mode="${mode}"]`).classList.add('active');
    
    // 显示/隐藏相应模式
    document.getElementById('audioToBase64Mode').style.display = mode === 'toBase64' ? 'block' : 'none';
    document.getElementById('audioToAudioMode').style.display = mode === 'toAudio' ? 'block' : 'none';
    
    // 重置状态
    if (mode === 'toBase64') {
        clearAudio();
    } else {
        clearAudioBase64Input();
    }
}

// 音频上传处理
function initAudioUpload() {
    const fileInput = document.getElementById('audioFileInput');
    const uploadArea = document.getElementById('audioUploadArea');
    
    if (fileInput && uploadArea) {
        fileInput.addEventListener('change', handleAudioFileSelect);
        
        // 拖拽功能
        uploadArea.addEventListener('dragover', handleAudioDragOver);
        uploadArea.addEventListener('dragleave', handleAudioDragLeave);
        uploadArea.addEventListener('drop', handleAudioDrop);
        uploadArea.addEventListener('click', () => fileInput.click());
    }
}

function handleAudioFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processAudioFile(file);
    }
}

function handleAudioDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleAudioDragLeave(event) {
    event.currentTarget.classList.remove('dragover');
}

function handleAudioDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processAudioFile(files[0]);
    }
}

function processAudioFile(file) {
    // 验证文件类型
    if (!file.type.startsWith('audio/')) {
        showAudioError('请选择音频文件');
        return;
    }
    
    // 验证文件大小 (20MB)
    if (file.size > 20 * 1024 * 1024) {
        showAudioError('文件大小不能超过20MB');
        return;
    }
    
    currentAudioFile = file;
    
    // 显示文件信息
    updateAudioFileInfo(file);
    
    // 读取并显示音频
    const reader = new FileReader();
    reader.onload = function(e) {
        displayAudio(e.target.result, file);
    };
    reader.readAsDataURL(file);
}

function updateAudioFileInfo(file) {
    document.getElementById('audioFileName').textContent = file.name;
    document.getElementById('audioFileSize').textContent = formatFileSize(file.size);
    document.getElementById('audioFileType').textContent = file.type;
}

function displayAudio(dataUrl, file) {
    const preview = document.getElementById('audioPreview');
    preview.src = dataUrl;
    
    preview.onloadedmetadata = function() {
        const duration = preview.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        document.getElementById('audioDuration').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('audioPreviewSection').style.display = 'block';
        generateAudioBase64(dataUrl, file);
    };
}

function generateAudioBase64(dataUrl, file) {
    const base64Data = showAudioDataURL ? dataUrl : dataUrl.split(',')[1];
    const output = document.getElementById('audioBase64Output');
    output.value = base64Data;
    
    // 更新统计信息
    document.getElementById('audioBase64Length').textContent = base64Data.length.toLocaleString();
    
    const compressionRatio = ((file.size / base64Data.length) * 100).toFixed(1);
    document.getElementById('audioCompressionRatio').textContent = compressionRatio + '%';
    
    document.getElementById('audioBase64OutputSection').style.display = 'block';
}

function toggleAudioDataURL() {
    if (!currentAudioFile) return;
    
    showAudioDataURL = !showAudioDataURL;
    const toggleIcon = document.getElementById('audioDataURLToggleIcon');
    const toggleText = document.getElementById('audioDataURLToggleText');
    
    if (showAudioDataURL) {
        toggleIcon.textContent = '🔗';
        toggleText.textContent = '仅显示Base64';
    } else {
        toggleIcon.textContent = '📄';
        toggleText.textContent = '显示Data URL';
    }
    
    // 重新生成Base64
    const preview = document.getElementById('audioPreview');
    const reader = new FileReader();
    reader.onload = function(e) {
        generateAudioBase64(e.target.result, currentAudioFile);
    };
    reader.readAsDataURL(currentAudioFile);
}

function copyAudioBase64() {
    const output = document.getElementById('audioBase64Output');
    output.select();
    document.execCommand('copy');
    showAudioSuccess('Base64编码已复制到剪贴板');
}

function downloadAudioBase64() {
    const output = document.getElementById('audioBase64Output');
    const content = output.value;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audio-base64-encoded.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function clearAudio() {
    currentAudioFile = null;
    const fileInput = document.getElementById('audioFileInput');
    if (fileInput) fileInput.value = '';
    
    const audioPreviewSection = document.getElementById('audioPreviewSection');
    if (audioPreviewSection) audioPreviewSection.style.display = 'none';
    
    const audioBase64OutputSection = document.getElementById('audioBase64OutputSection');
    if (audioBase64OutputSection) audioBase64OutputSection.style.display = 'none';
    
    const audioBase64Output = document.getElementById('audioBase64Output');
    if (audioBase64Output) audioBase64Output.value = '';
    
    const audioPreview = document.getElementById('audioPreview');
    if (audioPreview) {
        audioPreview.pause();
        audioPreview.src = '';
    }
    
    showAudioDataURL = false;
    
    // 重置切换按钮状态
    const toggleIcon = document.getElementById('audioDataURLToggleIcon');
    const toggleText = document.getElementById('audioDataURLToggleText');
    if (toggleIcon) toggleIcon.textContent = '🔗';
    if (toggleText) toggleText.textContent = '显示Data URL';
}

// Base64转音频功能
function decodeAudioBase64() {
    const input = document.getElementById('audioBase64Input').value.trim();
    if (!input) {
        showAudioError('请输入Base64编码');
        return;
    }
    
    try {
        let base64Data = input;
        let mimeType = 'audio/mpeg'; // 默认类型
        
        // 检查是否是Data URL格式
        if (input.startsWith('data:')) {
            const matches = input.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                mimeType = matches[1];
                base64Data = matches[2];
            } else {
                throw new Error('无效的Data URL格式');
            }
        }
        
        // 验证Base64格式
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
            throw new Error('无效的Base64编码');
        }
        
        // 创建音频
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        const audio = document.getElementById('decodedAudio');
        
        audio.onloadedmetadata = function() {
            const duration = audio.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            document.getElementById('decodedAudioDuration').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('decodedAudioFormat').textContent = mimeType;
            
            // 计算预计文件大小
            const estimatedSize = (base64Data.length * 0.75);
            document.getElementById('decodedAudioSize').textContent = formatFileSize(estimatedSize);
            
            document.getElementById('decodedAudioSection').style.display = 'block';
            updateAudioBase64InputStatus('✅ 解码成功', 'status-valid');
        };
        
        audio.onerror = function() {
            throw new Error('无法解码音频，请检查Base64编码是否正确');
        };
        
        audio.src = dataUrl;
        
    } catch (error) {
        showAudioError('解码失败: ' + error.message);
        updateAudioBase64InputStatus('❌ 解码失败', 'status-invalid');
    }
}

function pasteAudioBase64() {
    navigator.clipboard.readText().then(text => {
        document.getElementById('audioBase64Input').value = text;
        updateAudioBase64InputLength();
    }).catch(err => {
        showAudioError('无法访问剪贴板');
    });
}

function clearAudioBase64Input() {
    const audioBase64Input = document.getElementById('audioBase64Input');
    if (audioBase64Input) audioBase64Input.value = '';
    
    const decodedAudioSection = document.getElementById('decodedAudioSection');
    if (decodedAudioSection) decodedAudioSection.style.display = 'none';
    
    const decodedAudio = document.getElementById('decodedAudio');
    if (decodedAudio) {
        decodedAudio.pause();
        decodedAudio.src = '';
    }
    
    updateAudioBase64InputLength();
    updateAudioBase64InputStatus('等待输入...', '');
}

function downloadDecodedAudio() {
    const audio = document.getElementById('decodedAudio');
    if (!audio.src) return;
    
    const a = document.createElement('a');
    a.href = audio.src;
    a.download = 'decoded-audio.mp3';
    a.click();
}

function playDecodedAudio() {
    const audio = document.getElementById('decodedAudio');
    if (audio.src) {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    }
}

function updateAudioBase64InputLength() {
    const input = document.getElementById('audioBase64Input');
    const lengthElement = document.getElementById('audioBase64InputLength');
    if (input && lengthElement) {
        const length = input.value.length;
        lengthElement.textContent = length.toLocaleString();
    }
}

function updateAudioBase64InputStatus(message, className) {
    const status = document.getElementById('audioBase64InputStatus');
    if (status) {
        status.textContent = message;
        status.className = className;
    }
}

// 音频工具函数
function showAudioError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-display';
    errorDiv.textContent = message;
    
    const container = currentAudioMode === 'toBase64' ? 
        document.getElementById('audioToBase64Mode') : 
        document.getElementById('audioToAudioMode');
    if (container) {
        container.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
}

function showAudioSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-display';
    successDiv.textContent = message;
    
    const container = currentAudioMode === 'toBase64' ? 
        document.getElementById('audioToBase64Mode') : 
        document.getElementById('audioToAudioMode');
    if (container) {
        container.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}
