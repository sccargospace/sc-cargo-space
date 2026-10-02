

if (process.argv.length !== 3) {
  console.error(`${process.argv[0]} ${process.argv[1]} <total scu count>`)
  process.exit(1)
}

const MAX_LIMIT = 200;
const SCU = parseInt(process.argv[2]);

for (let w = 1; w < MAX_LIMIT; w++) {
  for (let h = 1; h < MAX_LIMIT; h++) {
    for (let l = 1; l < MAX_LIMIT; l++) {
      if (w * h * l === SCU) {
        console.log(`{"width": ${w}, "height": ${h}, "length": ${l}}`);
      }
    }
  }
}
