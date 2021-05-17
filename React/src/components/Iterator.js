export const getNumberIterator = () => {
    const context = {};
    let index = 0;
  
    context.next = () => index++;
  
    return context;
  };