import fs from 'fs';
import path from 'path';

const SRC_DIR = 'd:/Dev/College Web/frontend/src';

// We want to find files with alert() and add the toast import if not present.
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('alert(') && !content.includes('alert (')) {
    return;
  }
  
  let modified = false;

  // Replace data.status === "Success" alerts with NOTHING (data fetching success)
  // This is a bit tricky with regex, so we'll look for specific patterns:
  // e.g., alert(data.message) inside a success block, or just replace all alert(...) with toast(...)
  // The user requested to remove the annoying fetch success alerts. Usually they look like:
  // if(data.status === "Success") { setBosList(data.bos); alert(data.message) }
  // We will manually try to remove fetch alerts. Actually, to be safe, I'll just change all `alert(` to `toast.error(` or `toast.success(` based on context, or just `toast.success(`.
  // But wait, the user said "when all bos fetched to a page and fac fetched now its showing as alert... implement nice popup msg like thing in a modern way".
  // Maybe I'll just change `alert(` to `toast.success(`. Wait, `alert(err.message)` should be `toast.error`.
  // Regex: 
  // alert(err.message) -> toast.error(err.message)
  // alert("Failed...") -> toast.error("Failed...")
  // alert("Please fill...") -> toast.error("Please fill...")
  // alert(data.message) -> toast.success(data.message) // unless it's in a catch block
  
  const alertRegex = /alert\((.*?)\)/g;
  
  content = content.replace(alertRegex, (match, group1) => {
    modified = true;
    const lower = group1.toLowerCase();
    if (lower.includes('err') || lower.includes('fail') || lower.includes('fill') || lower.includes('select')) {
      return `toast.error(${group1})`;
    } else {
      // If it's data.message and we are just fetching, it's annoying. But we can just make it toast.success. Toasts auto-dismiss so it's less annoying than alerts.
      // Or we can just use toast.success.
      return `toast.success(${group1})`;
    }
  });

  if (modified) {
    if (!content.includes('toast')) {
      // Insert import at the top
      content = `import toast from "react-hot-toast";\n` + content;
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

walk(SRC_DIR);
