const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const target = `  const [isMobileTabOpen, setIsMobileTabOpen] = useState(false);`;

const replacement = `  const [isMobileTabOpen, setIsMobileTabOpen] = useState(false);
  
  useEffect(() => {
    if (activeTab === 'ai') {
      setAiPersonality(aiConfig.personality);
      setAiKnowledge(aiConfig.knowledge);
      setAiProviders(aiConfig.providers || []);
    }
  }, [activeTab, aiConfig]);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
