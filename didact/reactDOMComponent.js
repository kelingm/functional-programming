// 创建宿主组件实例
export const createInstance = (type, props, rootContainerInstance) => {
  const domElement = createElement(type, props, rootContainerInstance);
  precacheFiberNode(internalInstanceHandle, domElement);
  updateFiberProps(domElement, props);
  return domElement;
};
