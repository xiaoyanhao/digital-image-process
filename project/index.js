$ = function(id) {
  return document.getElementById(id);
}

var TEST = [
  'Aloe', 'Baby1', 'Baby2', 'Baby3',
  'Bowling1', 'Bowling2', 'Cloth1', 'Cloth2',
  'Cloth3', 'Cloth4', 'Flowerpots', 'Lampshade1',
  'Lampshade2', 'Midd1', 'Midd2', 'Monopoly',
  'Plastic', 'Rocks1', 'Rocks2', 'Wood1', 'Wood2'
];

window.onload = function() {
  generateDOMTree();
  var path = getTestPath();

  TEST.forEach(function(test, index) {
    var left_img = new Image();
    left_img.src = path[index][0];
    left_img.onload = function() {
      left_img = inputImage(this, test + '_left_eye_img');

      var right_img = new Image();
      right_img.src = path[index][1];
      right_img.onload = function() {
        right_img = inputImage(this, test + '_right_eye_img');

        testForStereoMatching(left_img, right_img, path[index], test);
      };
    };
  });
}

function generateDOMTree() {
  var eyes = ['left', 'right'];
  var methods = ['ssd', 'ncc', 'asw'];
  var docfag = document.createDocumentFragment();
  TEST.forEach(function(testValue, index, array) {
    var h1, h2, hr, div, canvas;
    eyes.forEach(function(eyeValue) {
      h1 = document.createElement('h1');
      h1.textContent = testValue + ' ' + eyeValue + ' image';
      hr = document.createElement('hr');
      docfag.appendChild(h1);
      docfag.appendChild(hr);
      div = document.createElement('div');
      canvas = document.createElement('canvas');
      canvas.id = testValue + '_' + eyeValue +'_eye_img';
      docfag.appendChild(div).appendChild(canvas);
      div = document.createElement('div');
      canvas = document.createElement('canvas');
      canvas.id = testValue + '_' + eyeValue + '_ground_truth';
      docfag.appendChild(div).appendChild(canvas);
    });

    methods.forEach(function(methodValue) {
      h1 = document.createElement('h1');
      h1.textContent = methodValue + ' stereo matching';
      hr = document.createElement('hr');
      docfag.appendChild(h1);
      docfag.appendChild(hr);
      eyes.forEach(function(eyeValue) {
        h2 = document.createElement('h2');
        h2.textContent = eyeValue + ' disparity map';
        div = document.createElement('div');
        div.id = testValue + '_' + methodValue + '_' + eyeValue + '_disp';
        docfag.appendChild(h2);
        docfag.appendChild(div);
      });
    });
  });

  document.body.appendChild(docfag);
}

function getTestPath() {
  var prefix = '../public/images/ALL-2views/';
  var len = TEST.length;
  var path = new Array(len);

  for (var i = 0; i < len; i++) {
    path[i] = new Array();
    path[i][0] = prefix + TEST[i] + '/view1.png';
    path[i][1] = prefix + TEST[i] + '/view5.png';
    path[i][2] = prefix + TEST[i] + '/disp1.png';
    path[i][3] = prefix + TEST[i] + '/disp5.png';
  }

  return path;
}

function testForStereoMatching(left_img, right_img, path, test) {
  // enhanceRightEyeImage(right_img);
  var method_func = [localStereoMatchingSSD, localStereoMatchingNCC, localStereoMatchingASW];
  var method_name = ['_ssd_', '_ncc_', '_asw_'];

  method_func.forEach(function(func, index) {
    var output_img1 = func(left_img, right_img, 'left');
    outputImage(output_img1, test + method_name[index] + 'left_disp');

    var left_ground_truth = new Image();
    left_ground_truth.src = path[2];
    left_ground_truth.onload = function() {
      left_ground_truth = inputImage(this, test + '_left_ground_truth');
      testQualityOfDisparityMap(left_ground_truth, output_img1, method_name[index], test, 'left');
    }

    var output_img5 = func(left_img, right_img, 'right');
    outputImage(output_img5, test + method_name[index] + 'right_disp');

    var right_ground_truth = new Image();
    right_ground_truth.src = path[3];

    right_ground_truth.onload = function() {
      right_ground_truth = inputImage(this, test + '_right_ground_truth');
      testQualityOfDisparityMap(right_ground_truth, output_img5, method_name[index], test, 'right');
    }
  });
}

function enhanceRightEyeImage(right_img) {
  var height = right_img.length;
  var width = right_img[0].length;
  var enhancement = 10;

  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      right_img[i][j][3] += enhancement;
    }
  }
}

function localStereoMatchingSSD(left_img, right_img, flag) {
  var height = left_img.length;
  var width = left_img[0].length;
  var window_size = 5;
  var win = (window_size - 1) / 2;
  var min_d = 0, max_d = 79;
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var min_disp = 255 * 255 * 25;

      for (var d = min_d; d <= max_d; d++) {
        var disparity = 0, mn = 0;

        for (var m = -win; m <= win; m++) {
          var h = i + m;
          if (h >= 0 && h < height) {
            for (var n = -win; n <= win; n++) {
              var w = j + n;
              if (w >= 0 && w < width) {
                if (flag == 'left' && w - d >= 0) {
                  mn++;
                  var disp = left_img[h][w][3] - right_img[h][w - d][3];
                  disparity += disp * disp;
                } else if (flag == 'right' && w + d < width) {
                  mn++;
                  var disp = (right_img[h][w][3] - left_img[h][w + d][3]);
                  disparity += disp * disp;
                }
              }
            }
          }
        }

        if (disparity / mn < min_disp) {
          min_disp = disparity / mn;
          output_img[i][j] = d * 3;
        }
      }
    }
  }

  return output_img;
}

function localStereoMatchingNCC(left_img, right_img, flag) {
  var height = left_img.length;
  var width = left_img[0].length;
  var window_size = 5;
  var win = (window_size - 1) / 2;
  var min_d = 0, max_d = 79;
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var max_disp = 0;

      for (var d = min_d; d <= max_d; d++) {
        var numerator = 0;
        var denominator_left = 0;
        var denominator_right = 0;

        for (var m = -win; m <= win; m++) {
          var h = i + m;
          if (h >= 0 && h < height) {
            for (var n = -win; n <= win; n++) {
              var w = j + n;
              if (w >= 0 && w < width) {
                if (flag == 'left' && w - d >= 0) {
                  numerator += left_img[h][w][3] * right_img[h][w - d][3];
                  denominator_left += left_img[h][w][3] * left_img[h][w][3];
                  denominator_right += right_img[h][w - d][3] * right_img[h][w - d][3];
                } else if (flag == 'right' && w + d < width) {
                  numerator += right_img[h][w][3] * left_img[h][w + d][3];
                  denominator_left += right_img[h][w][3] * right_img[h][w][3];
                  denominator_right += left_img[h][w + d][3] * left_img[h][w + d][3];
                }
              }
            }
          }
        }

        var denominator = Math.sqrt(denominator_left * denominator_right);
        var disparity = numerator / denominator;

        if (disparity > max_disp) {
          max_disp = disparity;
          output_img[i][j] = d * 3;
        }
      }
    }
  }

  return output_img;
}

function localStereoMatchingASW(left_img, right_img, flag) {
  RGBToLab(left_img);
  RGBToLab(right_img);
  var height = left_img.length;
  var width = left_img[0].length;
  var window_size = 5;
  var win = (window_size - 1) / 2;
  var min_d = 0, max_d = 79;
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var min_disp = 255 * 255 * 5;

      for (var d = min_d; d <= max_d; d++) {
        var numerator = 0;
        var denominator = 0;

        for (var m = -win; m <= win; m++) {
          var h = i + m;
          if (h >= 0 && h < height) {
            for (var n = -win; n <= win; n++) {
              var w = j + n;
              if (w >= 0 && w < width && (h != i || w != j)) {
                if (flag == 'left' && w - d >= 0 && j - d >= 0) {
                  var common_factor = adaptiveSupportWeight(
                    left_img[i][j], left_img[h][w], i, j, h, w
                  ) * adaptiveSupportWeight(
                    right_img[i][j - d], right_img[h][w - d], i, j - d, h, w - d
                  );
                  numerator += common_factor * (
                    Math.abs(left_img[h][w][0] - right_img[h][w - d][0]) +
                    Math.abs(left_img[h][w][1] - right_img[h][w - d][1]) +
                    Math.abs(left_img[h][w][2] - right_img[h][w - d][2])
                  );

                  denominator += common_factor;

                } else if (flag == 'right' && w + d < width && j + d < width) {
                  var common_factor = adaptiveSupportWeight(
                    right_img[i][j], right_img[h][w], i, j, h, w
                  ) * adaptiveSupportWeight(
                    left_img[i][j + d], left_img[h][w + d], i, j + d, h, w + d
                  );
                  numerator += common_factor * (
                    Math.abs(right_img[h][w][0] - left_img[h][w + d][0]) +
                    Math.abs(right_img[h][w][1] - left_img[h][w + d][1]) +
                    Math.abs(right_img[h][w][2] - left_img[h][w + d][2])
                  );

                  denominator += common_factor;
                }
              }
            }
          }
        }

        var disparity = numerator / denominator;

        if (disparity < min_disp) {
          min_disp = disparity;
          output_img[i][j] = d * 3;
        }
      }
    }
  }

  return output_img;
}

function adaptiveSupportWeight(p, q, px, py, qx, qy) {
  var Euclidean = Math.sqrt((p[4] - q[4]) * (p[4] - q[4]) + (p[5] - q[5]) * (p[5] - q[5]) + (p[6] - q[6]) * (p[6] - q[6]));
  var Laplacian = Math.sqrt((px - qx) * (px - qx) + (py - qy) * (py - qy));
  var rc = 7, rp = 36, k = 1;
  return k * Math.exp(-(Euclidean / rc + Laplacian / rp));
}

function gamma(x) {
  var X = x > 0.04045 ? Math.pow((x + 0.055) / 1.055, 2.4) : x / 12.92;
  return X * 100;
}

function Ft(t, t0, a) {
  return t > t0 ? Math.pow(t, 1 / 3) : a * t + 4 / 29;
}

function RGBToLab(input_img) {
  var height = input_img.length;
  var width = input_img[0].length;
  var t0 = Math.pow(6 / 29, 3);
  var a = (1 / 3) * (29 / 6) * (29 / 6);

  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      var R = gamma(input_img[i][j][0] / 255);
      var G = gamma(input_img[i][j][1] / 255);
      var B = gamma(input_img[i][j][2] / 255);
      var X = 0.4124 * R + 0.3576 * G + 0.1805 * B;
      var Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
      var Z = 0.0193 * R + 0.1192 * G + 0.9505 * B;
      X /= 95.047;
      Y /= 100.000;
      Z /= 108.883;
      var FX = Ft(X, t0, a);
      var FY = Ft(Y, t0, a);
      var FZ = Ft(Z, t0, a);
      input_img[i][j][4] = 116 * FX - 16; // CIE-L
      input_img[i][j][5] = 500 * (FX - FY); // CIE-a
      input_img[i][j][6] = 200 * (FY - FZ); // CIE-b
    }
  }
}

function testQualityOfDisparityMap(ground_truth, output_img, method, test, eye) {
  var height = ground_truth.length;
  var width = ground_truth[0].length;
  var bad_pixel = 0;

  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      if (Math.abs(ground_truth[i][j][3] - output_img[i][j]) > 3) {
        bad_pixel++;
      }
    }
  }

  var error_rate = bad_pixel / (height * width);
  console.log(test, method, eye, error_rate);
}

function inputImage(img, id) {
  var original_image = $(id);
  original_image.width = img.width;
  original_image.height = img.height;

  var canvas = original_image.getContext('2d');
  canvas.drawImage(img, 0, 0);
  var image_data = canvas.getImageData(0, 0, img.width, img.height);
  var data = image_data.data;
  var input_img = new Array(img.height);
  for (var i = 0, count = 0; i < img.height; i++) {
    input_img[i] = new Array(img.width);
    for (var j = 0; j < img.width; j++, count++) {
      var intensity = 0;
      input_img[i][j] = new Array();
      for (var k = 0; k < 3; k++, count++) {
        input_img[i][j][k] = data[count];
        intensity += data[count];
      }
      input_img[i][j][3] = intensity / 3;
    }
  }

  return input_img;
}

function outputImage(new_data, parent_id) {
  var height = new_data.length;
  var width = new_data[0].length;

  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var image_data = canvas.getContext('2d').createImageData(width, height);
  var data = image_data.data;

  for (var i = 0, count = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      data[count++] = new_data[i][j];
      data[count++] = new_data[i][j];
      data[count++] = new_data[i][j];
      data[count++] = 255;
    }
  }

  canvas.getContext('2d').putImageData(image_data, 0, 0);

  var br = document.createElement('br');
  var parent_node = $(parent_id);
  parent_node.appendChild(canvas);
  parent_node.appendChild(br);
}
