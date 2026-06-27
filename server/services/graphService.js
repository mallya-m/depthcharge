
function buildGraph(parsedFiles) {
  const allPaths = new Set(parsedFiles.map((f) => f.path));

  const inDegree = {};
  const outDegree = {};
  parsedFiles.forEach((f) => {
    inDegree[f.path] = inDegree[f.path] || 0;
    outDegree[f.path] = outDegree[f.path] || 0;
  });

  const links = [];

  parsedFiles.forEach((file) => {
    file.imports.forEach((importPath) => {
      const resolved = resolveImport(importPath, file.path, allPaths);
      if (!resolved) return;

      links.push({
        source: file.path,
        target: resolved,
      });

    
      outDegree[file.path] = (outDegree[file.path] || 0) + 1;
      inDegree[resolved] = (inDegree[resolved] || 0) + 1;
    });
  });

    const circularPaths = detectCycles(parsedFiles);
    const circularSet = new Set(circularPaths.flat());
    const GOD_FILE_THRESHOLD = 10;

    const nodes = parsedFiles.map((file) => {
    const inD = inDegree[file.path] || 0;
    const outD = outDegree[file.path] || 0;
    const isGod = inD > GOD_FILE_THRESHOLD;
    const isCircular = circularSet.has(file.path);
    const isIsolated = inD === 0 && outD === 0;

    let color = "green";
    if (isIsolated) color = "grey";
    if (isCircular) color = "yellow";
    if (isGod) color = "red";

    const complexity = outD + inD * 2;

    return {
      id: file.path,
      label: file.path.split("/").pop(), 
      path: file.path,
      inDegree: inD,
      outDegree: outD,
      color,
      complexity,
      isGod,
      isCircular,
      isIsolated,
      imports: file.imports,
    };
  });

  const stats = {
    totalFiles: nodes.length,
    totalLinks: links.length,
    godFiles: nodes.filter((n) => n.isGod).map((n) => n.path),
    circularDeps: circularPaths,
    isolatedFiles: nodes.filter((n) => n.isIsolated).map((n) => n.path),
    healthScore: calculateHealthScore(nodes, circularPaths),
    topConnected: [...nodes]
      .sort((a, b) => b.inDegree - a.inDegree)
      .slice(0, 5)
      .map((n) => ({ path: n.path, inDegree: n.inDegree })),
  };

  return { nodes, links, stats };
}

function resolveImport(importPath, fromFile, allPaths) {
  if (!importPath.startsWith(".") && !importPath.startsWith("/")) return null;

  const fromDir = fromFile.split("/").slice(0, -1).join("/");

  const combined = fromDir ? `${fromDir}/${importPath}` : importPath;

  const normalized = normalizePath(combined);

  if (allPaths.has(normalized)) return normalized;

  const extensions = [".js", ".jsx", ".ts", ".tsx"];
  for (const ext of extensions) {
    if (allPaths.has(normalized + ext)) return normalized + ext;
  }

  for (const ext of extensions) {
    const indexPath = `${normalized}/index${ext}`;
    if (allPaths.has(indexPath)) return indexPath;
  }

  return null; 
}

function normalizePath(filePath) {
  const parts = filePath.split("/");
  const resolved = [];
  for (const part of parts) {
    if (part === "..") {
      resolved.pop();
    } else if (part !== ".") {
      resolved.push(part);
    }
  }
  return resolved.join("/");
}

function detectCycles(parsedFiles) {
  const adj = {};
  parsedFiles.forEach((f) => {
    adj[f.path] = f.imports;
  });

  const visited = new Set();
  const inStack = new Set(); 
  const cycles = [];

  function dfs(node, stack) {
    visited.add(node);
    inStack.add(node);
    stack.push(node);

    const neighbors = adj[node] || [];
    for (const neighbor of neighbors) {
      if (!adj[neighbor]) continue; 

      if (!visited.has(neighbor)) {
        dfs(neighbor, stack);
      } else if (inStack.has(neighbor)) {
        
        const cycleStart = stack.indexOf(neighbor);
        cycles.push(stack.slice(cycleStart));
      }
    }

    stack.pop();
    inStack.delete(node);
  }

  parsedFiles.forEach((f) => {
    if (!visited.has(f.path)) {
      dfs(f.path, []);
    }
  });

  return cycles;
}

function calculateHealthScore(nodes, cycles) {
  let score = 100;
  const godFiles = nodes.filter((n) => n.isGod).length;
  const isolatedFiles = nodes.filter((n) => n.isIsolated).length;

  score -= cycles.length * 10;   
  score -= godFiles * 5;          
  score -= isolatedFiles * 1;     

  return Math.max(0, Math.min(100, score)); 
}

module.exports = { buildGraph };