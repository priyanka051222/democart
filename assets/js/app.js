angular
    .module("eCart", ['ngRoute'])
    .config(['$routeProvider', function(routeProvider) {
        routeProvider
            .when("/", {
                templateUrl: "assets/js/views/home.html",
                controller: "productListController"
            })
            .when("/cart", {
                templateUrl: "assets/js/views/cart-view.html",
                controller: "cartViewController"
            })
            .otherwise("/", {
                templateUrl: "assets/js/views/home.html",
                controller: "productListController"
            })

    }])

    .controller('productListController', ['$scope', '$http', '$rootScope', '$window', function(scope, http, rootScope, windowObj) {

        http.get('/api/getProducts').success(function(response) {
            scope.productList = response.products;
            if (response.productsInCart.length > 0) {
                $(".primary-cartIcon .cart-count").text(response.productsInCart.length);
            }

        });

        scope.viewLightBox = function() {
            windowObj.scrollTo(0,0);
            var $id = this.product.p_id;
            http.get('/api/searchProduct/' + $id)
                .success(function(response) {
                    scope.modalWindowProduct = response;
                });
        }

        scope.toggleCloseBtn = function() {
            scope.modalWindowProduct = false;
        }
        scope.setColor = function(colors) {
            scope.modalWindowProduct.selectedColor = colors.name;
        }

        scope.addToBag = function() {
            var selectedColor = [],
                colorsDB = scope.modalWindowProduct.p_available_options.colors;
            if (typeof(scope.modalWindowProduct.selectedColor) === "undefined") {
                alert("Please Select Color(s) of Product");
                return false;
            } else if (typeof(scope.modalWindowProduct.selectedSize) === "undefined") {
                alert("Please Select Size");
                return false;

            } else if (typeof(scope.modalWindowProduct.qty) === "undefined") {
                alert("Please Select Quantity");
                return false;

            } else {

                var buyProduct = {
                    "p_id": scope.modalWindowProduct.p_id,
                    "p_name": scope.modalWindowProduct.p_name,
                    "p_path": scope.modalWindowProduct.p_path,
                    "p_price": scope.modalWindowProduct.p_price * parseInt(scope.modalWindowProduct.qty),
                    "p_quantity": scope.modalWindowProduct.qty,
                    "p_style": scope.modalWindowProduct.p_style,
                    "p_selected_size": {
                        "code": scope.modalWindowProduct.selectedSize
                    },
                    "p_selected_color": {
                        "name": scope.modalWindowProduct.selectedColor
                    }
                }
                http.post('/api/addToCartProduct', buyProduct)
                    .success(function(response) {
                        if (response) {
                            alert("Product added in Cart");
                            if (response.length > 0) {
                                $(".primary-cartIcon .cart-count").text(response.length);
                            }
                            scope.modalWindowProduct = false;
                        }
                    });
            }
        }


    }])

    .controller('cartViewController', ['$scope', '$http', '$rootScope', '$window', function(scope, http, rootScope, windowObj) {
        function calculateTotal(productList) {
            // SUB total
            var subTotal = 0;
            $.each(productList, function(index, item) {
                subTotal = subTotal + (item.p_quantity * item.p_price);
            });

            //ESTIMATED Total
            var estiTotal = 0,
                discountRec = 0,
                qty = 0,
                promotionCode = "";

            for (var i in productList) {
                qty += parseInt(productList[i].p_quantity);
            }

            if (qty > 2 && qty <= 3) {
                promotionCode = "JF5";
                discountRec = subTotal * 5 / 100;
                estiTotal += subTotal - discountRec;

            } else if (qty > 3 && qty <= 6) {
                promotionCode = "JF10";
                discountRec = subTotal * 10 / 100;
                estiTotal += subTotal - discountRec

            } else if (qty > 10) {
                promotionCode = "JF25";
                discountRec = subTotal * 25 / 100;
                estiTotal += subTotal - discountRec

            } else {
                estiTotal += subTotal;
            }


            scope.productList = productList;
            scope.subTotal = subTotal.toFixed(2);
            scope.promotionCode = promotionCode;
            scope.discountRecieved = discountRec.toFixed(2);;
            scope.estiTotal = estiTotal.toFixed(2);
        }

        http.get('/api/cartPage')
            .success(function(response) {
                scope.productList = response;
                if (response.length > 0) {
                    $(".primary-cartIcon .cart-count").text(response.length);
                }
                calculateTotal(scope.productList);
            });




        //opening lightbox
        scope.removeProduct = function() {

            var removeProduct = {
                "p_id": this.data.p_id,
                "p_size": this.data.p_selected_size.code,
                "p_quantity": this.data.p_quantity,
                "p_selectedColor": this.data.p_selected_color.name
            }
            http.post('/api/removeFromCart', removeProduct)
                .success(function(response) {
                    if (response) {

                        alert("Product updated in Cart");

                        if (response.length > 0) {
                            $(".primary-cartIcon .cart-count").text(response.length);
                        }
                        scope.productList = response;
                        scope.modalWindowProduct = false;
                    }
                    calculateTotal(scope.productList);

                });

        }
        scope.viewLightBox = function() {
            windowObj.scrollTo(0,0);
            var $id = parseInt(this.data.p_id);

            http.get('/api/searchProduct/' + $id)
                .success(function(response) {

                    scope.modalWindowProduct = response;
                    scope.modalWindowProduct.selectedSize = response.p_selected_size.code;
                    scope.modalWindowProduct.selectedColor = response.p_selected_color.name;
                });
        }

        scope.toggleCloseBtn = function() {
            scope.modalWindowProduct = false;
        }

        scope.updatedQty = function(product) {

            if (typeof(product.selectedColor) === "undefined") {
                alert("Please Select Color(s) of Product");
                return false;
            } else if (typeof(product.selectedSize) === "undefined") {
                alert("Please Select Size");
                return false;

            } else if (typeof(product.qty) === "undefined") {
                alert("Please Select Quantity");
                return false;

            } else {

                var updateProduct = {
                    "p_id": product.p_id,
                    "p_name": product.p_name,
                    "p_path": product.p_path,
                    "p_price": product.p_price * parseInt(product.qty),
                    "p_quantity": product.qty,
                    "p_style": product.p_style,
                    "p_selected_size": {
                        "code": product.selectedSize
                    },
                    "p_selected_color": {
                        "name": product.selectedColor
                    }
                }

                http.post('/api/addToCartProduct', updateProduct)
                    .success(function(response) {
                        if (response) {

                            alert("Product updated in Cart");

                            if (response.length > 0) {
                                $(".primary-cartIcon .cart-count").text(response.length);
                            }
                            scope.productList = response;
                            scope.modalWindowProduct = false;
                        }
                        calculateTotal(scope.productList);
                    });
            }
        }

        scope.onChangeQuantity = function($event) {
            var _this = this.data,
                $p_id = _this.p_id,
                $p_size = _this.p_selected_size.code,
                $p_color = _this.p_selected_color.name,
                $p_quantity = $event.target.value;

            updateProduct = {};

            updateProduct = {
                "p_id": $p_id,
                "p_quantity": $p_quantity,
                "p_selected_size": {
                    "code": $p_size
                },
                "p_selected_color": {
                    "name": $p_color
                }
            }

            http.post('/api/addToCartProduct', updateProduct)
                .success(function(response) {
                    if (response) {

                        alert("Product updated in Cart");

                        if (response.length > 0) {
                            $(".primary-cartIcon .cart-count").text(response.length);
                            scope.productList = response;
                        }
                    }
                    calculateTotal(scope.productList);
                });
        }

    }]);
