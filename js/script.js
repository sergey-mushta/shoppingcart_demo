const products = [
    { 
        'code': 'GOKU', 
        'name': 'Goku POP', 
        'image_id': 'goku_pop', 
        'price': 5, 
        'discount_scheme': {
            'type': 'twoforone',
        }
    },
    { 
        'code': 'NARU', 
        'name': 'Naru POP', 
        'image_id': 'naru_pop', 
        'price': 20, 
        'discount_scheme': { 
            'type': 'bulk', 
            'params': {
                'qty_from': 3,
                'discount_bulk': 1
            },
        },
    },
    {   
        'code': 'LUF', 
        'name': 'Luffy POP', 
        'image_id': 'luffy_pop', 
        'price': 7.5 
    }
]

const discount_schemes = {
    'twoforone': (price, qty, _) => {
        return {
            'discount': parseInt(price) * parseInt(qty/2),
            'title': '2x1',
        }
    },
    'bulk': (_, qty, params) => {
        return {
            'discount': qty >= params['qty_from'] ? qty * params['discount_bulk'] : 0,
            'title': 'x' + params['qty_from'],
        }
    }

}

format_price = (price) => {
    return price.toFixed(2);
}

render_items = () => {
    const tpl = $('#product-item-tpl').html();
    const container = $('#products-items-container');
    container.html('');
    for (let key in products) {
        let content = tpl;
        for (let property in products[key]) {
            if(property !== 'discount_scheme') {
                content = content.replace(RegExp('{'+property+'}','g'), property === 'price' ? 
                            format_price(products[key][property]) : products[key][property]);
            }
        }
        container.append(content);
    }
}

recount_summary = () => {
    let total_items = 0;
    let total_price = 0;
    let total_discount = 0;
    const discounts_tpl = $('#discount-item-tpl').html();
    const discounts_container = $('#discounts-items-container');
    discounts_container.html('');
    $('.product-item').each((_, item) => {
        const code = $(item).attr('data-code');
        const product = products.find((item) => { return item.code === code });
        const qty = parseInt($(item).find(".input-qty").val())
        total_items += qty;
        total_price += parseFloat($(item).find(".total-value").html());
        if (product.discount_scheme !== undefined) {
            const discount_data = discount_schemes[product.discount_scheme.type](product.price, qty, product.discount_scheme.params)
            if(discount_data.discount !== 0) {
                let content = discounts_tpl;
                const replace = {
                    'discount_title': discount_data.title,
                    'product_name': product.name,
                    'discount': discount_data.discount,
                }
                for (let property in replace) {
                    content = content.replace(RegExp('{'+property+'}','g'), property === 'discount' ? 
                        format_price(replace[property]) : replace[property]);
                }
                discounts_container.append(content);
                total_discount += discount_data.discount;
            }
        }
    });
    if (total_discount > 0) {
        $('.discounts-container').removeClass('d-none');
    } else {
        $('.discounts-container').addClass('d-none');
    }
    $('#total-items-container').html(total_items);
    $('#total-items-multi').html(total_items === 1 ? '' : 's');
    $('#total-price-container').html(format_price(total_price));
    $('#final-price-container').html(format_price(total_price - total_discount));
}

recount_item = (code) => {
    const product = products.find((item) => { return item.code === code });
    const total_value = product.price * parseInt($('.product-item[data-code=' + code + '] .input-qty').val());
    $('.product-item[data-code=' + code + '] .total-value').html(format_price(total_value));
    recount_summary();
}

qty_btn_click_handler = (e) => {
    e.preventDefault();
    const code = $(e.currentTarget).parent().parent().attr('data-code');
    const input = $('.product-item[data-code=' + code + '] .input-qty');
    const value = parseInt(input.val()) + parseInt($(e.currentTarget).attr('data-sign'));
    if (value >= 0) input.val(value);
    recount_item(code);
}

input_qty_change_handler = (e) => {
    const val = $(e.currentTarget).val();
    if (parseInt(val) != val) $(e.currentTarget).val(0);
    recount_item($(e.currentTarget).parent().parent().attr('data-code'));
}

$(() => {
    render_items();
    $('.qty-btn').on('click', qty_btn_click_handler);
    $('.input-qty').on('input', input_qty_change_handler);
});
