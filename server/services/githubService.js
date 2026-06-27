const { Octokit }= require('@octokit/rest')
const axios = require('axios')

const octokit = new Octokit({
    auth : process.env.GITHUB_TOKEN,
});

function parseRepoUrl(url){
    const parts = url.replace("https://github.com/","").split("/");
    return{
        owner :parts[0],
        repo :parts[1],
    };
}

async function getFileTree(owner, repo){
    const { data } = await octokit.git.getTree({
        owner, 
        repo,
        tree_sha:'HEAD',
        recursive:'1',
    });
    return data.tree;
}

function filterJSFiles(tree){
    return tree.filter((file)=>{
        if(file.type !== "blob") return false;
        if(file.path.includes("node_modules")) return false ;
        if (file.path.includes("dist/") || file.path.includes("build/")) return false;
        return (
            file.path.endsWith(".js") ||
            file.path.endsWith(".jsx") ||
            file.path.endsWith(".ts") ||
            file.path.endsWith(".tsx")
        );  
    })
}
async function fetchFileContent(downloadUrl) {
  try {
    const response = await axios.get(downloadUrl);
    return response.data; 
  } catch {
    return null; 
  }
}

async function crawlRepo(repoUrl) {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const fullTree = await getFileTree(owner, repo);
  const jsFiles = filterJSFiles(fullTree);

  const filesWithContent = await Promise.all(
    jsFiles.map(async (file) => {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${file.path}`;
      const content = await fetchFileContent(rawUrl);
      return content ? { path: file.path, content } : null;
    })
  );

  return filesWithContent.filter(Boolean);
}

module.exports = { crawlRepo };