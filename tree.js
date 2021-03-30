/*
 * [144] 二叉树的前序遍历
 */

/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
// 迭代, 模拟调用栈
var preorderTraversal = function (root) {
  let result = [];
  let stack = [];
  if (root) stack.push(root);
  while (stack.length > 0) {
    let cur = stack.pop();
    result.push(cur.val);
    // 先push右边, 先进后出
    if (cur.right) {
      stack.push(cur.right);
    }
    if (cur.left) {
      stack.push(cur.left);
    }
  }
  return result;
};

// 递归
var preorderTraversal1 = function (root) {
  let result = [];
  const preorderTraversalNode = node => {
    if (node) {
      result.push(node.val);
      preorderTraversalNode(node.left);
      preorderTraversalNode(node.right);
    }
  };
  preorderTraversalNode(root);
  return result;
};

// 中序遍历
var inorderTraversal = function (root) {
  let result = [];
  let stack = [];
  let node = root;

  while (stack.length > 0 || node) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    result.push(node.val);
    node = node.right;
  }

  return result;
};

var inorderTraversal1 = function (root) {
  let result = [];
  const inorderTraversalNode = node => {
    if (node) {
      inorderTraversalNode(node.left);
      result.push(node.val);
      inorderTraversalNode(node.right);
    }
  };
  inorderTraversalNode(root);
  return result;
};

// 后序遍历
// 迭代
var postorderTraversal = function (root) {
  let result = [],
    stack = [],
    node = root;
  while (stack.length > 0 || node) {
    while (node) {
      stack.push(node);
      node = node.left;
    }

    node = stack.pop();
    if (node.right) {
      stack.push(node.right);
    } else {
      result.push(node.val);
    }
  }

  return result;
};

// 递归
var postorderTraversal1 = function (root) {
  let result = [];

  const postorderTraversalNode = node => {
    if (node) {
      postorderTraversalNode(node.left);
      postorderTraversalNode(node.right);
      result.push(node.val);
    }
  };
  postorderTraversalNode(root);
  return result;
};
