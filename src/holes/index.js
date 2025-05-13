const modules = import.meta.glob('./*.js', { eager: true });

const holes = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const name = path.match(/\.\/(.*)\.js$/)[1];
    return [name, mod.default];
  })
);

export default holes;
