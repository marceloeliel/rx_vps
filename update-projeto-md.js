// Script para atualizar automaticamente o PROJETO.md
// Execute: node update-projeto-md.js "descrição da mudança" "tipo"

const fs = require('fs');
const path = require('path');

// Função para obter a data atual formatada
function getCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

// Função para incrementar a versão
function incrementVersion(currentVersion) {
  const parts = currentVersion.split('.');
  const major = parseInt(parts[0]);
  const minor = parseInt(parts[1]);
  
  // Incrementa a versão minor
  return `${major}.${minor + 1}`;
}

// Função para atualizar o PROJETO.md
function updateProjetoMd(description, type = 'feature') {
  const filePath = path.join(__dirname, 'PROJETO.md');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ Arquivo PROJETO.md não encontrado!');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const currentDate = getCurrentDate();
  
  // Extrair versão atual
  const versionMatch = content.match(/\*\*🔄 Versão do Documento\*\*: (\d+\.\d+)/);
  const currentVersion = versionMatch ? versionMatch[1] : '2.0';
  const newVersion = incrementVersion(currentVersion);
  
  console.log(`🔄 Atualizando PROJETO.md...`);
  console.log(`📝 Descrição: ${description}`);
  console.log(`🏷️ Tipo: ${type}`);
  console.log(`📅 Data: ${currentDate}`);
  console.log(`🔢 Versão: ${currentVersion} → ${newVersion}`);

  // Determinar onde adicionar a mudança baseado no tipo
  let updateSection = '';
  let statusIcon = '';
  
  switch (type) {
    case 'feature':
      updateSection = '### **✅ Concluídas**';
      statusIcon = '✅';
      break;
    case 'bugfix':
      updateSection = '### **❌ Erros Críticos**';
      statusIcon = '✅ **RESOLVIDO**';
      break;
    case 'improvement':
      updateSection = '### **⚠️ Melhorias Necessárias**';
      statusIcon = '✅ **CONCLUÍDO**';
      break;
    case 'wip':
      updateSection = '### **🚧 Em Desenvolvimento**';
      statusIcon = '🚧';
      break;
    default:
      updateSection = '### **✅ Concluídas**';
      statusIcon = '✅';
  }

  // Adicionar nova entrada na seção apropriada
  const newEntry = `- [x] ${description} ${statusIcon}`;
  
  if (content.includes(updateSection)) {
    const sectionIndex = content.indexOf(updateSection);
    const nextSectionIndex = content.indexOf('###', sectionIndex + updateSection.length);
    const insertIndex = nextSectionIndex !== -1 ? nextSectionIndex : content.length;
    
    // Encontrar o final da lista atual
    const beforeNextSection = content.substring(sectionIndex, insertIndex);
    const lastItemIndex = beforeNextSection.lastIndexOf('- [x]');
    
    if (lastItemIndex !== -1) {
      const endOfLastItem = beforeNextSection.indexOf('\n', lastItemIndex);
      const insertPosition = sectionIndex + endOfLastItem + 1;
      content = content.slice(0, insertPosition) + newEntry + '\n' + content.slice(insertPosition);
    }
  }

  // Atualizar a data e versão no final do arquivo
  content = content.replace(
    /\*\*📅 Última Atualização\*\*: \d{2}\/\d{2}\/\d{4}/,
    `**📅 Última Atualização**: ${currentDate}`
  );
  
  content = content.replace(
    /\*\*🔄 Versão do Documento\*\*: \d+\.\d+/,
    `**🔄 Versão do Documento**: ${newVersion}`
  );

  // Adicionar log de mudanças se não existir
  if (!content.includes('## 📝 **LOG DE MUDANÇAS**')) {
    const logSection = `
---

## 📝 **LOG DE MUDANÇAS**

### **Versão ${newVersion}** - ${currentDate}
- ${description}

`;
    
    // Inserir antes da seção de contatos
    const contactsIndex = content.indexOf('## 📞 **CONTATOS E SUPORTE**');
    if (contactsIndex !== -1) {
      content = content.slice(0, contactsIndex) + logSection + content.slice(contactsIndex);
    }
  } else {
    // Adicionar nova entrada no log existente
    const logIndex = content.indexOf('## 📝 **LOG DE MUDANÇAS**');
    const nextSectionAfterLog = content.indexOf('###', logIndex + 50);
    
    if (nextSectionAfterLog !== -1) {
      const newLogEntry = `\n### **Versão ${newVersion}** - ${currentDate}\n- ${description}\n`;
      content = content.slice(0, nextSectionAfterLog) + newLogEntry + content.slice(nextSectionAfterLog);
    }
  }

  // Salvar o arquivo atualizado
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ PROJETO.md atualizado com sucesso!');
  console.log(`📄 Nova versão: ${newVersion}`);
}

// Executar o script
const args = process.argv.slice(2);
const description = args[0];
const type = args[1] || 'feature';

if (!description) {
  console.error('❌ Uso: node update-projeto-md.js "descrição da mudança" [tipo]');
  console.log('📋 Tipos disponíveis: feature, bugfix, improvement, wip');
  process.exit(1);
}

updateProjetoMd(description, type);





