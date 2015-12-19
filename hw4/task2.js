function task2() {
  var img = new Image();
  img.src = '../public/images/hw4_task_2.png';

  img.onload = function() {
    var input_img = inputImage(this, 'task2_original_image');
    var filter = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];

    var noise_img = noiseGenerator('Gaussian', input_img, 0, 40);
    outputImage(noise_img, 'gaussian');
    var output_img = arithmeticMeanFilter(noise_img, filter);
    outputImage(output_img, 'gaussian_arithmetic_mean_filter');
    output_img = geometricMeanFilter(noise_img, filter);
    outputImage(output_img, 'gaussian_geometric_mean_filter');
    output_img = medianFilter(noise_img, filter);
    outputImage(output_img, 'gaussian_median_filter');

    noise_img = noiseGenerator('salt-and-pepper', input_img, 0.2, 0);
    outputImage(noise_img, 'salt');
    output_img = harmonicMeanFilter(noise_img, filter);
    outputImage(output_img, 'salt_harmonic_mean_filter');
    output_img = contraharmonicaMeanFilter(noise_img, filter, 1.5);
    outputImage(output_img, 'salt_contraharmonic_mean_filter');
    output_img = contraharmonicaMeanFilter(noise_img, filter, -1.5);
    outputImage(output_img, 'salt_contraharmonic_mean_filter');

    noise_img = noiseGenerator('salt-and-pepper', input_img, 0.2, 0.2);
    outputImage(noise_img, 'salt_and_pepper');
    output_img = arithmeticMeanFilter(noise_img, filter);
    outputImage(output_img, 'salt_and_pepper_arithmetic_mean_filter');
    output_img = geometricMeanFilter(noise_img, filter);
    outputImage(output_img, 'salt_and_pepper_geometric_mean_filter');
    output_img = maxFilter(noise_img, filter);
    outputImage(output_img, 'salt_and_pepper_max_filter');
    output_img = minFilter(noise_img, filter);
    outputImage(output_img, 'salt_and_pepper_min_filter');
    output_img = medianFilter(noise_img, filter);
    outputImage(output_img, 'salt_and_pepper_median_filter');
  };
}

// 噪声产生器
function noiseGenerator(type, input_img, arg1, arg2) {
  if (type.toLowerCase() == 'gaussian') {
    return addGaussianNoise(input_img, arg1, arg2);
  } else if (type.toLowerCase() == 'salt-and-pepper') {
    return addSaltAndPepperNoise(input_img, arg1, arg2);
  }
}

// box-muller算法，添加高斯噪声。
function addGaussianNoise(input_img, mean, variance) {
  var height = input_img.length;
  var width = input_img[0].length;
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var u1 = Math.random();
      var u2 = Math.random();
      var z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      output_img[i][j] = (z * variance + mean) + input_img[i][j];
    }
  }

  return output_img;
}

// 添加椒盐噪声
function addSaltAndPepperNoise(input_img, salt, pepper) {
  var height = input_img.length;
  var width = input_img[0].length;
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var random = Math.random();
      if (random > 1 - salt) {
        output_img[i][j] = 255;
      } else if (random < pepper) {
        output_img[i][j] = 0;
      } else {
        output_img[i][j] = input_img[i][j];
      }
    }
  }

  return output_img;
}
