document.getElementById("study").innerHTML = "hello webpack"

let arr1 = [{
        id: 1,
        name: 'a'
    },
    {
        id: 2,
        name: 'abc'
    },
    {
        id: 3,
        name: 'abbb'
    },
    {
        id: 4,
        name: 'abxxx'
    },
    {
        id: 5,
        name: 'xyz'
    },
    {
        id: 6,
        name: 'abcdef'
    },
    {
        id: 7,
        name: 'abzzzz'
    }
];

let arr2 = [{
        id: 1,
        name: 'a'
    },
    {
        id: 5,
        name: 'xyz'
    },
    {
        id: 7,
        name: 'abzzzz'
    }
];

let result = arr1.filter( (item1)=> {
    return arr2.every( (item2)=> {
        return item2.id !== item1.id
    })
})