// gitHub auth
export const githubCallback = '/auth/github/callback';

//profile
export const profile = '/profile';

//repo
export const repos = '/repos';
export const repoSearch = "/repos/search"

//indexing
export const indexRepo = '/agents/index'
export const checkIndex = '/agents/check-index'

// codebase-qa
export const codebaseQA = '/agents/codebase-qa'
export const codebaseQAHistory = '/agents/codebase-qa/history'

// pr
export const prList = "/pr-list"
export const prReview = "/agents/pr-review"
export const prReviewHistory = "/agents/pr-review/history"
export const applyFixes = "/agents/pr-review/apply-fixes"
export const applyFixesToBranch = '/agents/pr-review/apply-fixes-to-branch'

// debugging
export const debug = "/agents/debug"
export const debugHistory = "/agents/debug/history"
export const applyDebugFix = '/agents/debug/apply-fix'

// test generator
export const generateTests = "/agents/test-generator"
export const testHistory = "/agents/test-generator/history"
export const saveTests = '/agents/test-generator/save'

// documentation
export const documentation = "/agents/documentation"
export const documentationHistory = "/agents/documentation/history"

// agents
export const repoFiles = "/agents/repo-files"