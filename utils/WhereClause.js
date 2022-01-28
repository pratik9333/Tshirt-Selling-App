// base - Product.find()
// base - Product.find(email: {"pratik@gmail.com"})

//bigQ - //search=coder&page=2&category=shortsleeves&rating[gte]=4
// &price[lte]=999&price[gte]=199&limit=5

class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  search() {
    const searchword = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find({ ...searchword });
    return this;
  }

  filter() {
    const copyBigQ = { ...this.bigQ };

    delete copyBigQ["search"];
    delete copyBigQ["page"];
    delete copyBigQ["limit"];

    //Convert into string
    let stringCopyQ = JSON.stringify(copyBigQ);

    stringCopyQ = stringCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, (m) => `$${m}`);

    //Convert Into object
    let jsonCopyQ = JSON.parse(stringCopyQ);

    //console.log(jsonCopyQ);

    this.base = this.base.find(jsonCopyQ);
    return this;
  }

  pager(limitPerPage) {
    let initialPage = 1;

    if (this.bigQ.page) {
      initialPage = this.bigQ.page;
    }
    if (this.bigQ.limit) {
      limitPerPage = this.bigQ.limit;
    }

    const skipval = limitPerPage * (initialPage - 1);
    this.base = this.base.limit(limitPerPage).skip(skipval);
    return this;
  }
}

module.exports = WhereClause;
