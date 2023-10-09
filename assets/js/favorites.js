export class GithubUser {
    static search(userName) {
        const endpoint = `https://api.github.com/users/${userName}`;

        return fetch(endpoint)
                .then(data => data.json())
                .then(data => {
                    const {login, name, public_repos, followers} = data

                    return {
                        login,
                        name, 
                        public_repos,
                        followers
                    }
                })

    }
}

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.load();
        /* GithubUser.search('viniciusxsousa').then(user => console.log(user)); */
    }

    load() {
        this.users = JSON.parse(localStorage.getItem('@github-favorite:')) || []
    }

    save() {
        localStorage.setItem('@github-favorite:', JSON.stringify(this.users));
    }

    async add(userName) {

        try{

            const userExist = this.users.find((user) => user.login === userName)

            if(userExist) {
                throw new Error('Usuário já cadastrado');
            }

            const user = await GithubUser.search(userName);

            if(user.name === undefined) {
                throw new Error('Usuário não encontrado!')
            }

            this.users = [user, ...this.users];
            this.update();
            this.save();

        } catch(erro) {
            alert(erro.message);
        }
    }

    delete(user) {
       const filterdUser = this.users.filter((element) => element.login != user.login);

       this.users = filterdUser;

       this.update(this.users);
       this.save(); 
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root);

        this.tbody = this.root.querySelector('table tbody');

        this.update();
        this.onAdd();   
    }

    update() {
        this.removeAllTr();

        this.users.forEach( (user) => {
            const row = this.createRow();

            row.querySelector('.table__user img').src = `https://github.com/${user.login}.png`;
            row.querySelector('.table__user img').alt = `Foto do perfil de ${user.name}`;
            row.querySelector('.table__user a').href= `https://github.com/${user.login}`;
            row.querySelector('.table__user a p').innerText = user.name;
            row.querySelector('.table__user a span').innerText = user.login;
            row.querySelector('.table__repository').innerText = user.public_repos;
            row.querySelector('.table__followers').innerHTML = user.followers;
            
            row.querySelector('.table__action').onclick = () => {
                const isOk = confirm(`Você deseja excluir ${user.name}`);
                
                if(isOk) {
                    this.delete(user);
                }
            }

            this.tbody.append(row);
        } )

    }


    onAdd() {
        const button = this.root.querySelector('.search button');

        button.onclick = () => {
            const { value } = document.querySelector('.search input');

            this.add(value);
        }
    }

    createRow() {
        const tr = document.createElement('tr');

        tr.innerHTML = ` 
            <td class="table__user">
            <img src="https://github.com/viniciusxsousa.png" alt="Foto de perfil do usuário">
            <a href="#" target='_black'><p>Vinicius Sousa</p><span>viniciusxsousa</span></a>
            </td>
            <td class="table__repository">23</td>
            <td class="table__followers">10</td>
            <td class="table__action"><button>x</button></td>
        `;

        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach((row) => {
            row.remove();
        })
    }
}