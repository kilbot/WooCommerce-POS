describe('lib/utilities/handlebars-helpers.js', function () {

    describe('formatAddress', function () {

        var hbs = require('handlebars');
        require('lib/utilities/handlebars-helpers');

        var countLines = function(result){
            return result.split(/\r\n|\r|\n/).length;
        };

        beforeEach(function() {
            this.data = { address: '' };
            this.html = '{{formatAddress address title="Address Title"}}';
        });

        it('will return an empty string if address attributes are empty', function() {
            var template = hbs.compile(this.html);
            var result = template(this.data);
            expect(result).equal('');
        });

        it('will return the title if an address attribute is present', function() {
            var template = hbs.compile(this.html);
            this.data.address = {
                first_name: 'Don'
            };
            var result = template(this.data);
            expect(result).equal('<h3>Address Title</h3>\nDon');
        });

        it('will not return lines of empty address attributes', function() {
            var template = hbs.compile(this.html);
            this.data.address = {
                city : 'New York',
                country : 'US',
                address_1 : '512 First Avenue',
                last_name : 'Draper',
                company : '',
                postcode : '12534',
                address_2 : '',
                state : 'NY',
                first_name : 'Don'
            };
            var result = template(this.data);
            expect(countLines(result)).equal(4);
        });

        it('will return 6 lines for a full address', function() {
            var template = hbs.compile(this.html);
            this.data.address = {
                phone : '215-523-4132',
                city : 'New York',
                country : 'US',
                address_1 : 'Apartment B',
                last_name : 'Draper',
                company : 'SDCP',
                postcode : '12534',
                email : 'thedon@mailinator.com',
                address_2 : '512 First Avenue',
                state : 'NY',
                first_name : 'Don'
            };
            var result = template(this.data);
            expect(countLines(result)).equal(6);
        });


    });
});