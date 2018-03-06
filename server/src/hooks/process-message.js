// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const text = context.data.text;
    const user = context.params.user; 
    console.log("hello");
    context.data = {
      text,
      userId: user._id,
      createdAt: new Date().getTime()
    }
    return context;
  };
};
