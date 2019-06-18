# Clone exam data

Clone list exam from website https://hoc.trangnguyen.edu.vn

Clone include:

- Luyện Tập

- Bài Giải

## install

`ghttps://github.com/viet-tools/tn-clone-exam.git`

`cd tn-clone-exam`

`npm i`

## Run

suggestion using VIP account for clone data

### If want clone via username and password (current not work because https://trangnguyen.edu.vn is close)

`username=<username> password=<password> node index.js`

### If want clone via token token

Login account in page: https://hoc.trangnguyen.edu.vn/dang-nhap

When login done, Press *F12* key and choose tab *Application*.

Right slide choose *Cookies* and next choose *https://hoc.trangnguyen.edu.vn*

Double click and copy *value* of key *tndata*

Final start application:

`token=<value_of_cookie_tndata> node index.js`

Data output at directory *data*

!['Screenshot](https://github.com/viet-tools/tn-register-multiple-account/blob/master/Screenshot.png?raw=true)

!['Screenshot](https://github.com/viet-tools/tn-register-multiple-account/blob/master/Screenshot.png?raw=true)

Enjoy!

## Author

Viet-tools
