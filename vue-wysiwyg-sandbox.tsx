import React, { useState } from 'react';
import { X, Plus, Trash2, ChevronLeft, ChevronRight, Square, Type, Image, Layout, List, Circle, MousePointer, ChevronDown, Layers, Code, Smartphone, Monitor, Tv, Grid } from 'lucide-react';

const ComponentTool = {
  SELECT: 'select',
  DIV: 'div',
  BUTTON: 'button',
  INPUT: 'input',
  TEXT: 'p',
  HEADING: 'h1',
  IMAGE: 'img',
  LIST: 'ul',
  SPAN: 'span',
  CONTAINER: 'container'
};

const ComponentDocs = {
  div: 'https://vuejs.org/api/built-in-special-elements.html#template',
  button: 'https://vuejs.org/guide/essentials/event-handling.html',
  input: 'https://vuejs.org/guide/essentials/forms.html',
  p: 'https://vuejs.org/guide/essentials/template-syntax.html',
  h1: 'https://vuejs.org/guide/essentials/template-syntax.html',
  img: 'https://vuejs.org/guide/essentials/template-syntax.html#attribute-bindings',
  ul: 'https://vuejs.org/guide/essentials/list.html',
  span: 'https://vuejs.org/guide/essentials/template-syntax.html',
  select: 'https://vuejs.org/guide/essentials/forms.html#select',
  container: 'https://vuejs.org/guide/components/slots.html'
};

const VIEWPORT_PRESETS = {
  'iPhone 13 Pro Portrait': { width: 390, height: 844 },
  'iPhone 13 Pro Landscape': { width: 844, height: 390 },
  'iPad Pro 11" Portrait': { width: 834, height: 1194 },
  'iPad Pro 11" Landscape': { width: 1194, height: 834 },
  '1920x1080 (Full HD)': { width: 1920, height: 1080 },
  '1366x768 (Laptop)': { width: 1366, height: 768 },
  '16:9 (720p)': { width: 1280, height: 720 },
  '16:9 (1080p)': { width: 1920, height: 1080 },
  '4:3 (1024x768)': { width: 1024, height: 768 },
  'Square (800x800)': { width: 800, height: 800 },
  'Custom': { width: 1200, height: 800 }
};

export default function VueWysiwygSandbox() {
  const [components, setComponents] = useState([]);
  const [selectedTool, setSelectedTool] = useState(ComponentTool.SELECT);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [nextId, setNextId] = useState(1);
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [viewportPreset, setViewportPreset] = useState('1920x1080 (Full HD)');
  const [customWidth, setCustomWidth] = useState(1200);
  const [customHeight, setCustomHeight] = useState(800);
  const [pwaEnabled, setPwaEnabled] = useState(false);
  const [canvasBackground, setCanvasBackground] = useState({
    type: 'solid',
    color: '#ffffff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    image: ''
  });

  const defaultStyles = {
    backgroundColor: '#ffffff',
    color: '#000000',
    padding: '10px',
    margin: '5px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#cccccc',
    borderRadius: '4px',
    boxShadow: 'none',
    zIndex: 0,
    width: 'auto',
    height: 'auto',
    minWidth: '50px',
    minHeight: '30px',
    display: 'block',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    gap: '0px',
    position: 'relative'
  };

  const addComponent = (e, parentId = null) => {
    if (selectedTool === ComponentTool.SELECT || !selectedTool) return;
    
    e.stopPropagation();
    
    let x, y;
    
    if (parentId) {
      const parentRect = e.currentTarget.getBoundingClientRect();
      x = e.clientX - parentRect.left;
      y = e.clientY - parentRect.top;
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    const newComponent = {
      id: nextId,
      type: selectedTool,
      x,
      y,
      content: getDefaultContent(selectedTool),
      styles: { ...defaultStyles },
      parentId: parentId,
      children: []
    };

    if (parentId) {
      setComponents(components.map(c => 
        c.id === parentId 
          ? { ...c, children: [...c.children, nextId] }
          : c
      ).concat(newComponent));
    } else {
      setComponents([...components, newComponent]);
    }
    
    setNextId(nextId + 1);
    setSelectedComponent(newComponent.id);
  };

  const getDefaultContent = (type) => {
    switch (type) {
      case ComponentTool.BUTTON:
        return 'Click me';
      case ComponentTool.INPUT:
        return '';
      case ComponentTool.TEXT:
        return 'Paragraph text';
      case ComponentTool.HEADING:
        return 'Heading';
      case ComponentTool.IMAGE:
        return 'https://via.placeholder.com/150';
      case ComponentTool.LIST:
        return 'List item';
      case ComponentTool.SPAN:
        return 'Inline text';
      case ComponentTool.DIV:
        return 'Container';
      case ComponentTool.SELECT:
        return 'Option 1,Option 2,Option 3';
      case ComponentTool.CONTAINER:
        return 'Drop components here';
      default:
        return 'Component';
    }
  };

  const removeComponent = (id) => {
    const comp = components.find(c => c.id === id);
    const toRemove = [id];
    
    if (comp && comp.children.length > 0) {
      const getChildren = (compId) => {
        const c = components.find(comp => comp.id === compId);
        if (c && c.children) {
          c.children.forEach(childId => {
            toRemove.push(childId);
            getChildren(childId);
          });
        }
      };
      getChildren(id);
    }
    
    setComponents(components
      .filter(c => !toRemove.includes(c.id))
      .map(c => c.parentId && toRemove.includes(c.parentId) 
        ? { ...c, parentId: null } 
        : c.children && c.children.some(childId => toRemove.includes(childId))
        ? { ...c, children: c.children.filter(childId => !toRemove.includes(childId)) }
        : c
      )
    );
    
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  const updateComponentStyle = (id, styleKey, value) => {
    setComponents(components.map(c => 
      c.id === id 
        ? { ...c, styles: { ...c.styles, [styleKey]: value } }
        : c
    ));
  };

  const updateComponentContent = (id, content) => {
    setComponents(components.map(c => 
      c.id === id ? { ...c, content } : c
    ));
  };

  const handleComponentClick = (e, id) => {
    e.stopPropagation();
    if (selectedTool === ComponentTool.SELECT || !selectedTool) {
      setSelectedComponent(id);
    }
  };

  const handleDragStart = (e, comp) => {
    setDraggedComponent(comp);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedComponent || draggedComponent.id === targetId) return;
    
    const target = components.find(c => c.id === targetId);
    if (!target || (target.type !== ComponentTool.CONTAINER && target.type !== ComponentTool.DIV)) return;
    
    const isChild = (parentId, childId) => {
      const parent = components.find(c => c.id === parentId);
      if (!parent) return false;
      if (parent.children.includes(childId)) return true;
      return parent.children.some(cId => isChild(cId, childId));
    };
    
    if (isChild(draggedComponent.id, targetId)) return;
    
    setComponents(components.map(c => {
      if (c.id === draggedComponent.parentId) {
        return { ...c, children: c.children.filter(cId => cId !== draggedComponent.id) };
      }
      if (c.id === draggedComponent.id) {
        return { ...c, parentId: targetId, x: 10, y: 10 };
      }
      if (c.id === targetId) {
        return { ...c, children: [...c.children, draggedComponent.id] };
      }
      return c;
    }));
    
    setDraggedComponent(null);
  };

  const exportCode = () => {
    const generateVueTemplate = (comp, indent = 2) => {
      const spaces = ' '.repeat(indent);
      const canHaveChildren = comp.type === ComponentTool.CONTAINER || comp.type === ComponentTool.DIV;
      const children = components.filter(c => c.parentId === comp.id);
      
      const styleStr = Object.entries(comp.styles)
        .filter(([k, v]) => v !== 'auto' && v !== '0px' && v !== 'none')
        .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
        .join('; ');
      
      let tag = comp.type === ComponentTool.CONTAINER ? 'div' : comp.type;
      let opening = `${spaces}<${tag}`;
      
      if (styleStr) {
        opening += ` style="${styleStr}"`;
      }
      
      if (comp.type === ComponentTool.SELECT) {
        const options = comp.content.split(',');
        opening += '>\n';
        options.forEach(opt => {
          opening += `${spaces}  <option value="${opt.trim()}">${opt.trim()}</option>\n`;
        });
        return opening + `${spaces}</${tag}>`;
      }
      
      if (canHaveChildren && children.length > 0) {
        opening += '>\n';
        children.forEach(child => {
          opening += generateVueTemplate(child, indent + 2) + '\n';
        });
        return opening + `${spaces}</${tag}>`;
      }
      
      if (comp.type === ComponentTool.IMAGE) {
        return `${opening} src="${comp.content}" alt="${comp.content}" />`;
      }
      
      if (comp.type === ComponentTool.INPUT) {
        return `${opening} placeholder="${comp.content}" v-model="inputValue" />`;
      }
      
      return `${opening}>${comp.content}</${tag}>`;
    };

    const template = components.filter(c => !c.parentId).map(c => generateVueTemplate(c)).join('\n');
    
    const bgStyle = canvasBackground.type === 'solid' 
      ? `background-color: ${canvasBackground.color}`
      : canvasBackground.type === 'gradient'
      ? `background: ${canvasBackground.gradient}`
      : `background-image: url(${canvasBackground.image})`;

    const pwaManifest = pwaEnabled ? `
// manifest.json
{
  "name": "Vue WYSIWYG App",
  "short_name": "VueApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "${canvasBackground.color}",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

// In your index.html, add:
// <link rel="manifest" href="/manifest.json">
// <meta name="theme-color" content="#667eea">
` : '';

    const code = `<template>
  <div class="app-container" style="${bgStyle}">
${template}
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      inputValue: ''
    }
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  ${bgStyle};
}
</style>

${pwaManifest}`;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vue-component.vue';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderComponent = (comp, isNested = false) => {
    const isSelected = selectedComponent === comp.id;
    const canHaveChildren = comp.type === ComponentTool.CONTAINER || comp.type === ComponentTool.DIV;
    
    const componentStyle = {
      position: isNested ? comp.styles.position : 'absolute',
      left: isNested ? 'auto' : comp.x,
      top: isNested ? 'auto' : comp.y,
      ...comp.styles,
      outline: isSelected ? '2px solid #3b82f6' : 'none',
      cursor: selectedTool === ComponentTool.SELECT ? 'move' : 'pointer'
    };

    const props = {
      style: componentStyle,
      onClick: (e) => handleComponentClick(e, comp.id),
      draggable: selectedTool === ComponentTool.SELECT,
      onDragStart: (e) => handleDragStart(e, comp),
      onDragOver: canHaveChildren ? handleDragOver : undefined,
      onDrop: canHaveChildren ? (e) => handleDrop(e, comp.id) : undefined
    };

    const children = components.filter(c => c.parentId === comp.id);

    const renderChildren = () => (
      <div className="relative" style={{ minHeight: '50px' }}>
        {children.length === 0 && canHaveChildren && (
          <div className="text-gray-400 text-xs p-2">Drop components here</div>
        )}
        {children.map(child => renderComponent(child, true))}
      </div>
    );

    switch (comp.type) {
      case ComponentTool.BUTTON:
        return <button key={comp.id} {...props}>{comp.content}</button>;
      case ComponentTool.INPUT:
        return <input key={comp.id} {...props} placeholder={comp.content || 'Input'} />;
      case ComponentTool.TEXT:
        return <p key={comp.id} {...props}>{comp.content}</p>;
      case ComponentTool.HEADING:
        return <h1 key={comp.id} {...props}>{comp.content}</h1>;
      case ComponentTool.IMAGE:
        return <img key={comp.id} {...props} src={comp.content} alt="component" />;
      case ComponentTool.LIST:
        return (
          <ul key={comp.id} {...props}>
            <li>{comp.content}</li>
          </ul>
        );
      case ComponentTool.SPAN:
        return <span key={comp.id} {...props}>{comp.content}</span>;
      case ComponentTool.SELECT:
        const options = comp.content.split(',');
        return (
          <select key={comp.id} {...props}>
            {options.map((opt, i) => (
              <option key={i} value={opt.trim()}>{opt.trim()}</option>
            ))}
          </select>
        );
      case ComponentTool.CONTAINER:
      case ComponentTool.DIV:
        return (
          <div key={comp.id} {...props} onClick={(e) => {
            if (selectedTool !== ComponentTool.SELECT) {
              addComponent(e, comp.id);
            } else {
              handleComponentClick(e, comp.id);
            }
          }}>
            {comp.type === ComponentTool.CONTAINER && (
              <div className="text-xs text-gray-500 mb-1 font-mono">&lt;container&gt;</div>
            )}
            {renderChildren()}
          </div>
        );
      default:
        return <div key={comp.id} {...props}>{comp.content}</div>;
    }
  };

  const selectedComp = components.find(c => c.id === selectedComponent);
  const viewport = VIEWPORT_PRESETS[viewportPreset];

  const getCanvasBackground = () => {
    if (canvasBackground.type === 'solid') return canvasBackground.color;
    if (canvasBackground.type === 'gradient') return canvasBackground.gradient;
    if (canvasBackground.type === 'image') return `url(${canvasBackground.image})`;
    return '#ffffff';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarVisible && (
        <div className="w-80 bg-white shadow-lg flex flex-col overflow-y-auto">
          <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600">
            <h1 className="text-xl font-bold text-white">Vue.js Sandbox</h1>
            <p className="text-sm text-blue-50">WYSIWYG Component Editor</p>
          </div>

          {/* Viewport Controls */}
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-sm font-semibold mb-2 text-gray-700">Layout & Export</h2>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Viewport</label>
                <select
                  value={viewportPreset}
                  onChange={(e) => setViewportPreset(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  {Object.keys(VIEWPORT_PRESETS).map(preset => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                </select>
              </div>
              
              {viewportPreset === 'Custom' && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600">Width</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseInt(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600">Height</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseInt(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-medium text-gray-600">PWA Support</label>
                <button
                  onClick={() => setPwaEnabled(!pwaEnabled)}
                  className={`px-3 py-1 rounded text-xs ${pwaEnabled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {pwaEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <button
                onClick={exportCode}
                className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Code size={16} />
                Export Vue Code
              </button>
            </div>
          </div>

          {/* Background Styling */}
          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold mb-2 text-gray-700">Canvas Background</h2>
            <div className="space-y-2">
              <select
                value={canvasBackground.type}
                onChange={(e) => setCanvasBackground({...canvasBackground, type: e.target.value})}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="solid">Solid Color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image URL</option>
              </select>

              {canvasBackground.type === 'solid' && (
                <input
                  type="color"
                  value={canvasBackground.color}
                  onChange={(e) => setCanvasBackground({...canvasBackground, color: e.target.value})}
                  className="w-full h-8 rounded cursor-pointer"
                />
              )}

              {canvasBackground.type === 'gradient' && (
                <select
                  value={canvasBackground.gradient}
                  onChange={(e) => setCanvasBackground({...canvasBackground, gradient: e.target.value})}
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">Purple Dream</option>
                  <option value="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">Pink Sunset</option>
                  <option value="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">Ocean Blue</option>
                  <option value="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">Fresh Green</option>
                  <option value="linear-gradient(135deg, #fa709a 0%, #fee140 100%)">Warm Flame</option>
                </select>
              )}

              {canvasBackground.type === 'image' && (
                <input
                  type="text"
                  value={canvasBackground.image}
                  onChange={(e) => setCanvasBackground({...canvasBackground, image: e.target.value})}
                  placeholder="Image URL"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              )}
            </div>
          </div>

          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold mb-3 text-gray-700">Component Tools</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedTool(ComponentTool.SELECT)}
                className={`p-3 rounded flex flex-col items-center justify-center gap-1 transition ${
                  selectedTool === ComponentTool.SELECT
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <MousePointer size={20} />
                <span className="text-xs font-mono">select</span>
              </button>
              
              {Object.entries(ComponentTool).filter(([k, v]) => v !== 'select').map(([key, value]) => (
                <button
                  key={value}
                  onClick={() => setSelectedTool(value)}
                  className={`p-3 rounded flex flex-col items-center justify-center gap-1 transition ${
                    selectedTool === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {value === 'div' && <Square size={20} />}
                  {value === 'button' && <Layout size={20} />}
                  {value === 'input' && <Type size={20} />}
                  {value === 'p' && <Type size={20} />}
                  {value === 'h1' && <Type size={20} />}
                  {value === 'img' && <Image size={20} />}
                  {value === 'ul' && <List size={20} />}
                  {value === 'span' && <Circle size={20} />}
                  {value === 'select' && <ChevronDown size={20} />}
                  {value === 'container' && <Layers size={20} />}
                  <span className="text-xs font-mono">{value}</span>
                </button>
              ))}
            </div>
            {selectedTool && selectedTool !== ComponentTool.SELECT && (
              <a
                href={ComponentDocs[selectedTool]}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-xs text-blue-600 hover:underline block"
              >
                📖 Vue.js Docs: {selectedTool}
              </a>
            )}
          </div>

          {selectedComp && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">
                  Edit: {selectedComp.type}
                </h2>
                <button
                  onClick={() => removeComponent(selectedComp.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {selectedComp.parentId && (
                <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  Nested in: {components.find(c => c.id === selectedComp.parentId)?.type}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Content</label>
                  <input
                    type="text"
                    value={selectedComp.content}
                    onChange={(e) => updateComponentContent(selectedComp.id, e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>

                {/* Layout & Responsive */}
                <div className="border-t pt-3">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2">Layout</h3>
                  
                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Display</label>
                    <select
                      value={selectedComp.styles.display}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'display', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="block">Block</option>
                      <option value="flex">Flex</option>
                      <option value="inline-block">Inline Block</option>
                      <option value="inline">Inline</option>
                      <option value="grid">Grid</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  {selectedComp.styles.display === 'flex' && (
                    <>
                      <div className="mb-2">
                        <label className="text-xs text-gray-600 block mb-1">Flex Direction</label>
                        <select
                          value={selectedComp.styles.flexDirection}
                          onChange={(e) => updateComponentStyle(selectedComp.id, 'flexDirection', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="row">Row</option>
                          <option value="column">Column</option>
                          <option value="row-reverse">Row Reverse</option>
                          <option value="column-reverse">Column Reverse</option>
                        </select>
                      </div>

                      <div className="mb-2">
                        <label className="text-xs text-gray-600 block mb-1">Justify Content</label>
                        <select
                          value={selectedComp.styles.justifyContent}
                          onChange={(e) => updateComponentStyle(selectedComp.id, 'justifyContent', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="flex-start">Start</option>
                          <option value="center">Center</option>
                          <option value="flex-end">End</option>
                          <option value="space-between">Space Between</option>
                          <option value="space-around">Space Around</option>
                          <option value="space-evenly">Space Evenly</option>
                        </select>
                      </div>

                      <div className="mb-2">
                        <label className="text-xs text-gray-600 block mb-1">Align Items</label>
                        <select
                          value={selectedComp.styles.alignItems}
                          onChange={(e) => updateComponentStyle(selectedComp.id, 'alignItems', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="flex-start">Start</option>
                          <option value="center">Center</option>
                          <option value="flex-end">End</option>
                          <option value="stretch">Stretch</option>
                          <option value="baseline">Baseline</option>
                        </select>
                      </div>

                      <div className="mb-2">
                        <label className="text-xs text-gray-600 block mb-1">Flex Wrap</label>
                        <select
                          value={selectedComp.styles.flexWrap}
                          onChange={(e) => updateComponentStyle(selectedComp.id, 'flexWrap', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="nowrap">No Wrap</option>
                          <option value="wrap">Wrap</option>
                          <option value="wrap-reverse">Wrap Reverse</option>
                        </select>
                      </div>

                      <div className="mb-2">
                        <label className="text-xs text-gray-600 block mb-1">Gap</label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={parseInt(selectedComp.styles.gap)}
                          onChange={(e) => updateComponentStyle(selectedComp.id, 'gap', `${e.target.value}px`)}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{selectedComp.styles.gap}</span>
                      </div>
                    </>
                  )}

                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Position</label>
                    <select
                      value={selectedComp.styles.position}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'position', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="relative">Relative</option>
                      <option value="absolute">Absolute</option>
                      <option value="fixed">Fixed</option>
                      <option value="sticky">Sticky</option>
                    </select>
                  </div>
                </div>

                {/* Sizing */}
                <div className="border-t pt-3">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2">Sizing</h3>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Width</label>
                      <input
                        type="text"
                        value={selectedComp.styles.width}
                        onChange={(e) => updateComponentStyle(selectedComp.id, 'width', e.target.value)}
                        placeholder="auto"
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Height</label>
                      <input
                        type="text"
                        value={selectedComp.styles.height}
                        onChange={(e) => updateComponentStyle(selectedComp.id, 'height', e.target.value)}
                        placeholder="auto"
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Min Width</label>
                      <input
                        type="text"
                        value={selectedComp.styles.minWidth}
                        onChange={(e) => updateComponentStyle(selectedComp.id, 'minWidth', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Min Height</label>
                      <input
                        type="text"
                        value={selectedComp.styles.minHeight}
                        onChange={(e) => updateComponentStyle(selectedComp.id, 'minHeight', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Max Width</label>
                      <input
                        type="text"
                        value={selectedComp.styles.maxWidth || 'none'}
                        onChange={(e) => updateComponentStyle(selectedComp.id, 'maxWidth', e.target.value)}
                        placeholder="none"
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Max Height</label>
                      <input
                        type="text"
                        value={selectedComp.styles.maxHeight || 'none'}
                        onChange={(e) => updateComponentStyle(selectedComp.id, 'maxHeight', e.target.value)}
                        placeholder="none"
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div className="border-t pt-3">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2">Colors</h3>
                  
                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Background</label>
                    <input
                      type="color"
                      value={selectedComp.styles.backgroundColor}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'backgroundColor', e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Text Color</label>
                    <input
                      type="color"
                      value={selectedComp.styles.color}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'color', e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Spacing */}
                <div className="border-t pt-3">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2">Spacing</h3>
                  
                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Padding</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={parseInt(selectedComp.styles.padding)}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'padding', `${e.target.value}px`)}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{selectedComp.styles.padding}</span>
                  </div>

                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Margin</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={parseInt(selectedComp.styles.margin)}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'margin', `${e.target.value}px`)}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{selectedComp.styles.margin}</span>
                  </div>
                </div>

                {/* Borders */}
                <div className="border-t pt-3">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2">Borders</h3>
                  
                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Border Width</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={parseInt(selectedComp.styles.borderWidth)}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'borderWidth', `${e.target.value}px`)}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{selectedComp.styles.borderWidth}</span>
                  </div>

                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Border Style</label>
                    <select
                      value={selectedComp.styles.borderStyle}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'borderStyle', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                      <option value="double">Double</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Border Color</label>
                    <input
                      type="color"
                      value={selectedComp.styles.borderColor}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'borderColor', e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Border Radius</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={parseInt(selectedComp.styles.borderRadius)}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'borderRadius', `${e.target.value}px`)}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{selectedComp.styles.borderRadius}</span>
                  </div>
                </div>

                {/* Effects */}
                <div className="border-t pt-3">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2">Effects</h3>
                  
                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Box Shadow</label>
                    <select
                      value={selectedComp.styles.boxShadow}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'boxShadow', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="none">None</option>
                      <option value="0 1px 3px rgba(0,0,0,0.12)">Small</option>
                      <option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
                      <option value="0 10px 15px rgba(0,0,0,0.1)">Large</option>
                      <option value="0 20px 25px rgba(0,0,0,0.15)">Extra Large</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="text-xs text-gray-600 block mb-1">Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(selectedComp.styles.opacity || 1) * 100}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'opacity', e.target.value / 100)}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{Math.round((selectedComp.styles.opacity || 1) * 100)}%</span>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Z-Index</label>
                    <input
                      type="number"
                      value={selectedComp.styles.zIndex}
                      onChange={(e) => updateComponentStyle(selectedComp.id, 'zIndex', parseInt(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-2 flex items-center gap-2">
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Toggle Sidebar"
          >
            {sidebarVisible ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          <span className="text-sm text-gray-600">
            {selectedTool === ComponentTool.SELECT 
              ? 'Select/Move mode - Click to select, drag to move'
              : selectedTool 
              ? `Click to add <${selectedTool}>`
              : 'Select a tool from the sidebar'}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {viewport.width} × {viewport.height}
            </span>
            <span className="text-sm text-gray-500">
              {components.length} component{components.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-300 flex items-center justify-center p-4">
          <div
            onClick={addComponent}
            className="relative overflow-auto shadow-2xl"
            style={{ 
              width: viewportPreset === 'Custom' ? customWidth : viewport.width,
              height: viewportPreset === 'Custom' ? customHeight : viewport.height,
              background: getCanvasBackground(),
              backgroundSize: canvasBackground.type === 'image' ? 'cover' : 'auto',
              backgroundPosition: 'center'
            }}
          >
            {components.filter(c => !c.parentId).map(comp => renderComponent(comp))}
            {components.filter(c => !c.parentId).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Plus size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Select a component tool and click to add</p>
                  <p className="text-xs mt-2">Use 'container' for nested components</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}