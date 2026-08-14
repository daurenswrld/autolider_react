export const INITIAL_CATEGORIES = [
  {
    id: 'engine',
    name: 'Двигатель и компоненты',
    icon: 'Cpu',
    count: 1420,
    subcategories: ['ГБЦ и поршни', 'Фильтры масляные', 'Ремни и ролики ГРМ', 'Свечи зажигания', 'Турбины']
  },
  {
    id: 'chassis',
    name: 'Ходовая часть и подвеска',
    icon: 'Disc',
    count: 2180,
    subcategories: ['Амортизаторы и стойки', 'Тормозные диски и колодки', 'Рычаги и сайлентблоки', 'Пружины подвески', 'Подшипники ступицы']
  },
  {
    id: 'body',
    name: 'Кузовные детали и оптика',
    icon: 'Shield',
    count: 3100,
    subcategories: ['Бамперы и решетки', 'Фары и фонари', 'Капоты и крылья', 'Зеркала заднего вида', 'Стекла и щетки']
  },
  {
    id: 'electronics',
    name: 'Электроника и датчики',
    icon: 'Zap',
    count: 980,
    subcategories: ['Аккумуляторы', 'Генераторы и стартеры', 'Датчики ABS и кислорода', 'Предохранители и реле', 'Штатная мультимедиа']
  },
  {
    id: 'fluids',
    name: 'Масла и технические жидкости',
    icon: 'Droplet',
    count: 750,
    subcategories: ['Моторные масла', 'Трансмиссионные масла', 'Тормозная жидкость', 'Антифризы и ОЖ', 'Автохимия']
  },
  {
    id: 'wheels',
    name: 'Шины и диски',
    icon: 'CircleDot',
    count: 1650,
    subcategories: ['Летние шины', 'Зимние шины', 'Литые диски', 'Штампованные диски', 'Колпаки и крепеж']
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 101,
    title: 'Тормозные диски вентилируемые передние Brembo Extra',
    article: 'BR-09.A427.11',
    category: 'chassis',
    categoryName: 'Ходовая часть',
    price: 34500,
    oldPrice: 39000,
    rating: 4.9,
    reviewsCount: 28,
    inStock: true,
    stockCount: 14,
    brand: 'Brembo',
    carCompatibility: ['Changan CS75', 'Chery Tiggo 8 Pro', 'Haval Jolion', 'Geely Monjaro'],
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80',
    description: 'Оригинальные перфорированные тормозные диски Brembo Extra с увеличенной теплоотдачей и антикоррозийным покрытием UV.',
    specs: {
      'Диаметр [мм]': '300',
      'Толщина [мм]': '25',
      'Число отверстий': '5',
      'Сторона установки': 'Передний мост',
      'Страна производства': 'Италия'
    },
    seller: {
      name: 'Autolider Direct Store',
      rating: 4.95,
      salesCount: 1240
    }
  },
  {
    id: 102,
    title: 'Масло моторное синтетическое Shell Helix Ultra 5W-30 4L',
    article: 'SH-5W30-4L',
    category: 'fluids',
    categoryName: 'Масла и жидкости',
    price: 18900,
    oldPrice: 22000,
    rating: 5.0,
    reviewsCount: 142,
    inStock: true,
    stockCount: 52,
    brand: 'Shell',
    carCompatibility: ['Все марки (Универсальное)'],
    image: 'https://images.unsplash.com/photo-1599256872237-5dcc3f54263a?w=600&auto=format&fit=crop&q=80',
    description: 'Полностью синтетическое моторное масло, созданное на основе уникальной технологии Shell PurePlus из природного газа.',
    specs: {
      'Вязкость': '5W-30',
      'Объем [л]': '4',
      'Состав': 'Синтетическое',
      'Спецификация API': 'SP / SN Plus',
      'Допуски': 'MB 229.5, VW 502.00/505.00'
    },
    seller: {
      name: 'Shell Kazakhstan Official',
      rating: 4.98,
      salesCount: 3890
    }
  },
  {
    id: 103,
    title: 'Комплект светодиодных фар Matrix LED Haval Jolion',
    article: 'HV-LED-8821',
    category: 'body',
    categoryName: 'Кузов и оптика',
    price: 185000,
    oldPrice: 210000,
    rating: 4.8,
    reviewsCount: 19,
    inStock: true,
    stockCount: 5,
    brand: 'Haval Genuine',
    carCompatibility: ['Haval Jolion 2021-2025'],
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80',
    description: 'Оригинальный блок фары головного света LED с функциями бегущего поворотника и автоматического дальнего света.',
    specs: {
      'Тип источника': 'Matrix LED',
      'Напряжение': '12V',
      'Комплектация': 'Левая + Правая',
      'Гарантия': '12 месяцев'
    },
    seller: {
      name: 'China Auto Parts',
      rating: 4.88,
      salesCount: 650
    }
  },
  {
    id: 104,
    title: 'Фильтр масляный картридж Mann-Filter HU 711/51 x',
    article: 'HU71151X',
    category: 'engine',
    categoryName: 'Двигатель',
    price: 4200,
    oldPrice: 5100,
    rating: 4.9,
    reviewsCount: 95,
    inStock: true,
    stockCount: 88,
    brand: 'Mann-Filter',
    carCompatibility: ['Changan', 'Geely', 'Chery'],
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
    description: 'Высокоэффективный фильтрующий элемент премиум-класса с синтетической микроволокнистой мембраной.',
    specs: {
      'Внешний диаметр [мм]': '64',
      'Внутренний диаметр [мм]': '29',
      'Высота [мм]': '115'
    },
    seller: {
      name: 'Autolider Direct Store',
      rating: 4.95,
      salesCount: 1240
    }
  },
  {
    id: 105,
    title: 'Свечи зажигания иридиевые NGK Laser Iridium (Комплект 4 шт.)',
    article: 'NGK-ILKAR7L11',
    category: 'engine',
    categoryName: 'Двигатель',
    price: 24800,
    oldPrice: 28000,
    rating: 5.0,
    reviewsCount: 64,
    inStock: true,
    stockCount: 30,
    brand: 'NGK',
    carCompatibility: ['Chery Tiggo 7/8', 'Exeed TXL', 'Jetour Dashing'],
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80',
    description: 'Иридиевые свечи зажигания с тонким центральным электродом для надежного искрообразования и экономии топлива.',
    specs: {
      'Материал электрода': 'Иридий / Платина',
      'Зазор [мм]': '1.1',
      'Размер резьбы': 'M12x1.25',
      'Шестигранник': '14 мм'
    },
    seller: {
      name: 'Spark & Auto Supply',
      rating: 4.91,
      salesCount: 870
    }
  },
  {
    id: 106,
    title: 'Аккумулятор автомобильный Bosch S4 Silver 60Ah 540A',
    article: '0092S40050',
    category: 'electronics',
    categoryName: 'Электроника',
    price: 46000,
    oldPrice: 52000,
    rating: 4.8,
    reviewsCount: 33,
    inStock: true,
    stockCount: 18,
    brand: 'Bosch',
    carCompatibility: ['Универсальный (Евро полярность)'],
    image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80',
    description: 'Надежная необслуживаемая стартерная батарея Bosch с технологией PowerFrame для суровых зимних условий.',
    specs: {
      'Емкость [Ач]': '60',
      'Пусковой ток [А]': '540',
      'Полярность': 'Обратная [ - + ]',
      'Длина/Ширина/Высота': '242x175x190 мм'
    },
    seller: {
      name: 'Bosch Center KZ',
      rating: 4.97,
      salesCount: 2150
    }
  }
];

export const INITIAL_BRANDS = [
  { name: 'Changan', logo: '/assets/img/changan.png' },
  { name: 'Chery', logo: '/assets/img/chery.png' },
  { name: 'Haval', logo: '/assets/img/haval.png' },
  { name: 'Jetour', logo: '/assets/img/jetour.png' }
];

export const INITIAL_GARAGE = [
  {
    id: 'g1',
    make: 'Haval',
    model: 'Jolion',
    year: '2023',
    engine: '1.5 Turbo (150 л.с.)',
    vin: 'LHG39182390192831',
    isPrimary: true
  },
  {
    id: 'g2',
    make: 'Chery',
    model: 'Tiggo 8 Pro Max',
    year: '2024',
    engine: '2.0 TGDI (197 л.с.)',
    vin: 'LVV20194827591827',
    isPrimary: false
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-89211',
    date: '12.08.2026',
    status: 'active',
    statusText: 'В доставке',
    totalPrice: 53400,
    itemsCount: 2,
    deliveryType: 'Курьерская доставка',
    city: 'Алматы, пр. Абая 150',
    items: [
      {
        title: 'Тормозные диски вентилируемые передние Brembo Extra',
        price: 34500,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80'
      },
      {
        title: 'Масло моторное синтетическое Shell Helix Ultra 5W-30 4L',
        price: 18900,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1599256872237-5dcc3f54263a?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'ORD-88104',
    date: '28.07.2026',
    status: 'completed',
    statusText: 'Выполнен',
    totalPrice: 24800,
    itemsCount: 1,
    deliveryType: 'Самовывоз из магазина',
    city: 'Астана, ул. Кабанбай батыра 21',
    items: [
      {
        title: 'Свечи зажигания иридиевые NGK Laser Iridium (Комплект 4 шт.)',
        price: 24800,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80'
      }
    ]
  }
];

export const INITIAL_SELLER_SALES = [
  {
    id: 'SALE-1049',
    customer: 'Арман Сериков',
    phone: '+7 (707) 888-23-45',
    date: '13.08.2026 18:40',
    status: 'pending',
    statusText: 'Новый заказ',
    amount: 185000,
    paymentStatus: 'Оплачено Kaspi Pay',
    items: [
      { title: 'Комплект светодиодных фар Matrix LED Haval Jolion', qty: 1, price: 185000 }
    ]
  },
  {
    id: 'SALE-1048',
    customer: 'Дмитрий Иванов',
    phone: '+7 (777) 123-45-67',
    date: '13.08.2026 14:15',
    status: 'processing',
    statusText: 'В сборке',
    amount: 38700,
    paymentStatus: 'Оплачено Картой',
    items: [
      { title: 'Тормозные диски вентилируемые Brembo', qty: 1, price: 34500 },
      { title: 'Фильтр масляный Mann-Filter', qty: 1, price: 4200 }
    ]
  },
  {
    id: 'SALE-1045',
    customer: 'Бауржан Кусаинов',
    phone: '+7 (701) 999-00-11',
    date: '11.08.2026 10:20',
    status: 'shipped',
    statusText: 'Передан в доставку',
    amount: 92000,
    paymentStatus: 'Оплачено Kaspi Pay',
    items: [
      { title: 'Аккумулятор Bosch S4 Silver 60Ah', qty: 2, price: 46000 }
    ]
  }
];

export const STORES_BY_CITY = {
  'Алматы': [
    { id: 1, name: 'Флагманский магазин Autolider — пр. Абая 150', schedule: '09:00 - 21:00' },
    { id: 2, name: 'Пункт выдачи Autolider Express — ул. Райымбека 212', schedule: '10:00 - 20:00' }
  ],
  'Астана': [
    { id: 3, name: 'Автоцентр Autolider Capital — пр. Мангилик Ел 55', schedule: '09:00 - 21:00' },
    { id: 4, name: 'Склад-магазин — ул. Кабанбай батыра 21', schedule: '09:00 - 20:00' }
  ],
  'Шымкент': [
    { id: 5, name: 'Магазин Autolider Юг — пр. Тауке хана 88', schedule: '09:00 - 19:30' }
  ],
  'Караганда': [
    { id: 6, name: 'Пункт выдачи — ул. Бухар-Жырау 42', schedule: '10:00 - 19:00' }
  ]
};

export const CATALOG_PRODUCTS_MOCK = [
  {
    id: 'p1',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски Trebl X40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  },
  {
    id: 'p2',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски Trebl X40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  },
  {
    id: 'p3',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски Trebl X40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  },
  {
    id: 'p4',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски Trebl X40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  },
  {
    id: 'p5',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски TreblLX40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  },
  {
    id: 'p6',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски Trebl X40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  },
  {
    id: 'p7',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски Trebl X40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  },
  {
    id: 'p8',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски Trebl X40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  },
  {
    id: 'p9',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски Trebl X40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  },
  {
    id: 'p10',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски Trebl X40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  },
  {
    id: 'p11',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски Trebl X40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  },
  {
    id: 'p12',
    badgeHit: true,
    discount: '-15%',
    title: 'Диски Trebl X40030_P 6,5x16 5x139.7 ET40 DIA98.6 silver',
    subtitle: 'Диски, кованные, 13-15 дюймов',
    price: '12 000₸/шт',
    oldPrice: '12 000₸',
    img: '/assets/img/test_accessosry.png'
  }
];
