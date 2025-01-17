export default class ViewManager {
    constructor(){
        this.tbody = document.querySelector("#tbody")
        this.newFileBtn = document.querySelector('#newFileBtn')
        this.fileElem = document.querySelector('#fileElem')
        this.progressModal = document.querySelector('#progressModal')
        this.progressBar = document.querySelector('#progressBar')
        this.output = document.querySelector('#output')

        this.formater = new Intl.DateTimeFormat('pt', {
            locale: 'pt-br',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })

        this.instance = {}
    }
    configureModal(){
        this.modalInstance = M.Modal.init(this.progressModal, {
            opacity: 0,
            dismissable: false,
            //isso aqui libera para você cliclar na tela
            // mesmo com o modal aberto
            onOpenEnd(){
                this.$overlay[0].remove()
            }
        })
    }

    openModal(){
        this.modalInstance.open()
    }

    closeModal(){
        this.modalInstance.close()
    }

    updateStatus(size){
        this.output.innerHTML = `Uploadinf in <b>${Math.floor(size)}% <b>`
        this.progressBar.value = size
    }

    configureOnFileChange(fn){
        this.fileElem.onchange = (e) => fn(e.target.files)
    }

    configureFileBtnClick(){
        this.newFileBtn.onclick = () =>{ 
            console.log('called');
          return  this.fileElem.click()
        }
    }

    getIcon(file){
       return file.match(/\.mp4/i) ? 'movie'
            : file.match(/\.jp|png/i) ? 'image' : 'content_copy'
    }

    makeIcon(file){
        const icon = this.getIcon(file)
       const colors = {
            image: 'yellow600',
            movie: 'red600',
            file: ''
        }
        return `
            <i class="material-icons ${colors[icon]} left">${icon}</i> 
        `
    }

    updateCurrentFiles(files){
        const template = (item) => 
        ` <tr>
        <td> ${this.makeIcon(item.file)} ${item.file}</td>
        <td>${item.owner}</td>
        <td>${this.formater.format(new Date(item.lastModified))}</td>
        <td>${item.size}</td>
        </tr>
        `

        this.tbody.innerHTML = files.map(template).join('')
    }
}